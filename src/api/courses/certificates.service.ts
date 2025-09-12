import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Generate certificate */
  async getCertificateInfo(createCertificateDto: CreateCertificateDto) {
    const { studentId, courseId, studentName, url } = createCertificateDto;
    try {
      const student = await this.DB.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!student)
        throw new NotFoundException(`Student with ID ${studentId} not found`);

      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course)
        throw new NotFoundException(`Course with ID ${courseId} not found`);

      const certificate = await this.DB.certificate.create({
        data: {
          studentName,
          url,
          issuedAt: new Date(),
          student: { connect: { id: studentId } },
          course: { connect: { id: courseId } },
        },
      });

      return {
        success: true,
        message: 'Certificate created successfully',
        certificate,
      };
    } catch (error) {
      this.logger.error(`Failed to create quiz`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create quiz');
    }
  }

  /** Get certificate info */
  async getCertificate(courseId: number, studentId: number) {
    try {
      const certificate = await this.DB.certificate.findFirst({
        where: { courseId, studentId },
      });

      if (!certificate) {
        throw new NotFoundException('Certificate not found');
      }
      return certificate;
    } catch (error) {
      this.logger.error(`Failed to create quiz`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create quiz');
    }
  }

  /** List certificates */
  async listUserCertificates(studentId: number) {
    try {
      const listOfCertificates = this.DB.certificate.findMany({
        where: { studentId },
        orderBy: { issuedAt: 'desc' },
      });
      if (!listOfCertificates) {
        throw new NotFoundException('Certificate not found');
      }
      return listOfCertificates;
    } catch (error) {
      this.logger.error(`Failed to create quiz`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create quiz');
    }
  }
}
