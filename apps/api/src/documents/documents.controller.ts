import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @CurrentUser() user: { sub: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title?: string; docType?: string; deadline?: string; notes?: string; isScaryMail?: string },
  ) {
    return this.documents.upload(user.sub, file, {
      title: body.title,
      docType: body.docType,
      deadline: body.deadline,
      notes: body.notes,
      isScaryMail: body.isScaryMail === 'true',
    });
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.documents.create(user.sub, body);
  }

  @Post(':id/analyze')
  analyze(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.documents.analyze(user.sub, id);
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
