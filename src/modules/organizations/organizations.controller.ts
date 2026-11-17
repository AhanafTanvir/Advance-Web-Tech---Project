import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { JwtGuard, RolesGuard } from "@/src/common/guard";
import { AuthUser } from "@/src/common/interfaces/auth-user.interface";
import { Roles } from "@/src/common/decorators";
import { Role } from "@/src/common/enums/role.enum";

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
    @UseGuards(JwtGuard) 
    create(@Body() createOrgDto: CreateOrganizationDto, 
    @Req() req: {user: AuthUser}){
        return this.organizationsService.create(createOrgDto, req.user.id);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.organizationsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtGuard)
    update(@Param('id', ParseUUIDPipe) id: string,
            @Body() updateOrganizationDto: UpdateOrganizationDto){
    return this.organizationsService.update(id, updateOrganizationDto);
    }

    @Patch(':id/verify')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    verify(@Param('id', ParseUUIDPipe)id: string){
        return this.organizationsService.verify(id);
    }

    @Delete(':id')
    @UseGuards(JwtGuard)
    remove(@Param('id', ParseUUIDPipe)id: string){
    return this.organizationsService.remove(id)
    }
}