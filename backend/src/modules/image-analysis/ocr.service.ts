import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createWorker, Worker } from 'tesseract.js';

@Injectable()
export class OcrService {
  private worker: Worker | null = null;

  async initializeWorker(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker('hun+eng'); // Magyar és angol nyelv támogatás
      console.log('OCR Worker initialized');
    }
  }

  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      // Worker inicializálása ha szükséges
      await this.initializeWorker();

      if (!this.worker) {
        throw new Error('OCR Worker initialization failed');
      }

      // Ellenőrizzük, hogy a fájl létezik-e
      const fullPath = path.resolve(imagePath);
      if (!fs.existsSync(fullPath)) {
        throw new BadRequestException(`Image file not found: ${imagePath}`);
      }

      // OCR feldolgozás
      const {
        data: { text },
      } = await this.worker.recognize(fullPath);

      console.log('OCR extracted text:', text.substring(0, 200) + '...');

      return text;
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new BadRequestException(`OCR processing failed: ${error.message}`);
    }
  }

  async extractTextFromBuffer(imageBuffer: Buffer): Promise<string> {
    try {
      // Worker inicializálása ha szükséges
      await this.initializeWorker();

      if (!this.worker) {
        throw new Error('OCR Worker initialization failed');
      }

      // OCR feldolgozás buffer-ből
      const {
        data: { text },
      } = await this.worker.recognize(imageBuffer);

      console.log('OCR extracted text from buffer:', text.substring(0, 200) + '...');

      return text;
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new BadRequestException(`OCR processing failed: ${error.message}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      console.log('OCR Worker terminated');
    }
  }

  // Lifecycle hook - cleanup when module is destroyed
  async onModuleDestroy(): Promise<void> {
    await this.cleanup();
  }
}
