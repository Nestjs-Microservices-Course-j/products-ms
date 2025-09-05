import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {


  private readonly logger = new Logger('ProductsService')
  
  onModuleInit() {
    this.$connect();
    this.logger.log(`Database connected`);
    
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll( paginationDto : PaginationDto ) {
    const { page, limit } = paginationDto;

    const total = await this.product.count({ where: { available: true } });

    return {
      data: await this.product.findMany({
              skip: (page - 1) * limit,
              take: limit,
              where: { available: true }
            }),
      meta: {
        page,
        total,
        totalPages: Math.ceil( total / limit ),
      }
        
    

    }

    
  }

  async findOne(id: number) {
   const product = await this.product.findFirst({
    where: { id,  available: true }
   });

   if( !product )
       throw new NotFoundException(`Product with id #${ id } not found`);

   return product;
  }

  //* se quita el id en los microservicios y se agrega en el dto
  async update(/*id: number, */ updateProductDto: UpdateProductDto) {

    const { id, ...rest } = updateProductDto;
    await this.findOne( id );

    return  this.product.update({
      where: {id }, 
      data: rest
    })
  }

  async remove(id: number) {
    await this.findOne( id );

    // return  this.product.delete({
    //   where: {id }
    // })

    return  this.product.update({
      where: {id }, 
      data: { available: false }
    })

  }
}
