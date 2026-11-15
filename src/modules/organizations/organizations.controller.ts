import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";

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
}