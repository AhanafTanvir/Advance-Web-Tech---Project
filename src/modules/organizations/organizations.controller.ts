import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req } from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";

@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService){}

    @Get()
    findAll(
        @Query('page')page: string = '1',
        @Query('limit')limit: string = '10'
    ){
        return this.organizationsService.findAll(parseInt(page), parseInt(limit));
    }

    @Post()
    create(@Body() createOrgDto: CreateOrganizationDto, @Req() req: any){
        const userId = req.user?.id || 'dummy-user-id';
        return this.organizationsService.create(createOrgDto, userId);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.organizationsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string,
            @Body() updateOrganizationDto: UpdateOrganizationDto){
    return this.organizationsService.update(id, updateOrganizationDto);
    }

    @Patch(':id/verify')
    verify(@Param('id', ParseUUIDPipe)id: string){
        return this.organizationsService.verify(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe)id: string){
    return this.organizationsService.remove(id)
    }
}