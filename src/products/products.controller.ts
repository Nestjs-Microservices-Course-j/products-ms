import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { PaginationDto } from 'src/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //@Post()
  @MessagePattern({ cmd: 'create' }) //* escuchando a travez de MessagePattern
  create(
    //@Body() createProductDto: CreateProductDto
    @Payload() createProductDto: CreateProductDto //* los microservicios reciben los parametros con el payload
  ) {
    return this.productsService.create(createProductDto);
  }

  //@Get()
  @MessagePattern({ cmd: 'find_all' })
  findAll(
    //@Query() paginationDto : PaginationDto 
    @Payload() paginationDto : PaginationDto //* los queries param tambien se reciben por el payload en microservicios
  ) {
    return this.productsService.findAll( paginationDto );
  }

  //@Get(':id')
  @MessagePattern({ cmd: 'find_one' })
  findOne(
    //@Param('id') id: string
    @Payload('id', ParseIntPipe) id: number //* los params tambien se reciben por el payload en microservicios
  ) {
    return this.productsService.findOne(id);
  }

  //@Patch(':id')
  @MessagePattern({ cmd: 'update' })
  update(
    //@Param('id', ParseIntPipe) id: number, 
    //@Body() updateProductDto: UpdateProductDto
    @Payload() updateProductDto: UpdateProductDto //* en el caso del id se incluye en el dto
  ) {
    return this.productsService.update( updateProductDto );
  }

  //@Delete(':id')
  @MessagePattern({ cmd: 'delete' })
  remove(
    //@Param('id', ParseIntPipe) id: number
    @Payload('id', ParseIntPipe) id: number
  ) {
    return this.productsService.remove(id);
  }

  @MessagePattern({cmd: 'validate_products'})
  validateProduct( @Payload() ids: number[] ){
    return this.productsService.validateProducts( ids );
  }
}
