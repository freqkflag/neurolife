import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { DocumentsService } from './documents.service';
import { StorageService } from './storage.service';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private documents: DocumentsService,
    private storage: StorageService,
  ) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.documents.list(user.sub);
  }

  @Post('upload-url')
  getUploadUrl(@Body() body: { fileName: string; mimeType: string }) {
    return this.storage.getUploadUrl(body.fileName, body.mimeType);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.documents.create(user.sub, body);
  }

  @Post(':id/extract')
  extract(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    return this.documents.extractScaryMail(user.sub, id, content);
  }
}
