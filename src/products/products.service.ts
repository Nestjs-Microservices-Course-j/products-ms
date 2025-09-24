import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from "@prisma/client";

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

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
       throw new RpcException({
        message: `Product with id #${ id } not found`,
        status: HttpStatus.BAD_REQUEST
      }); //con esto se muestra más estetico el error en microservicios y manda el statusCode
          //throw new NotFoundException(`Product with id #${ id } not found`);

   return product;
  }

  //* se quita el id en los microservicios y se agrega en el dto
  async update(/*id: number, */ updateProductDto: UpdateProductDto) {

    const { id, ...rest } = updateProductDto;
    await this.findOne( id );

    return  this.product.update({
      where: { id }, 
      data: updateProductDto
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

  async validateProducts( ids: number[] ) {
    //*Un Set es un tipo de estructura en js sin duplicados, es decir purga los duplicados de un arreglo
    ids = Array.from( new Set( ids ) );

    const products = await this.product.findMany({
      where: {
        id: { in: ids } //busca en la tabla todos los ids del arreglo
      }
    });

    if( products.length != ids.length ) {
        throw new RpcException({ 
          message: 'Some produts were not found',
          status: HttpStatus.BAD_REQUEST
        })
    }

    return products;
  }
}
