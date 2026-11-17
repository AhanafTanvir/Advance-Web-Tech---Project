import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { JwtGuard, RolesGuard } from "@/src/common/guard";
import { AuthUser } from "@/src/common/interfaces/auth-user.interface";
import { Roles } from "@/src/common/decorators";
import { Role } from "@/src/common/enums/role.enum";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Organizations")
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService){}

    @Get()
    @ApiOperation({ summary: "Get all organizations with pagination" })
    findAll(
        @Query('page')page: string = '1',
        @Query('limit')limit: string = '10'
    ){
        return this.organizationsService.findAll(parseInt(page), parseInt(limit));
    }

    @Post()
    @UseGuards(JwtGuard) 
    @ApiBearerAuth()
    @ApiOperation({summary: "Create a new organization."})
    create(@Body() createOrgDto: CreateOrganizationDto, 
    @Req() req: {user: AuthUser}){
        return this.organizationsService.create(createOrgDto, req.user.id);
    }

    @Get(':id')
    @ApiOperation({summary: "Get a specific organization by ID."})
    findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.organizationsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: "Update a specific organization by ID."})
    update(@Param('id', ParseUUIDPipe) id: string,
            @Body() updateOrganizationDto: UpdateOrganizationDto,
            @Req() req: {user: AuthUser})
    {
        return this.organizationsService.update(id, updateOrganizationDto, req.user.id, req.user.roles);
    }

    @Patch(':id/verify')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({summary: "Verify a specific organization by ID."})
    verify(@Param('id', ParseUUIDPipe)id: string){
        return this.organizationsService.verify(id);
    }

    @Delete(':id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: "Delete a specific organization by ID."})
    remove(@Param('id', ParseUUIDPipe)id: string,
    @Req() req: {user: AuthUser}){
    return this.organizationsService.remove(id, req.user.id, req.user.roles)
    }
}