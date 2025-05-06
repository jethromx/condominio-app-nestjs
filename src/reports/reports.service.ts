import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { CondominiumService } from 'src/condominium/condominium.service';
import { MaintenanceFeesService } from 'src/maintenance_fees/maintenance_fees.service';
import { PaymentsService } from 'src/payments/payments.service';
import { ACTIVE } from 'src/common/messages.const';
@Injectable()
export class ReportsService {
  private readonly CREATE_REPORT = 'CREATE_REPORT';
  private readonly UPDATE_REPORT = 'UPDATE_REPORT';
  private readonly DELETE_REPORT = 'DELETE_REPORT';
  private readonly FIND_ALL_REPORT = 'FIND_ALL_REPORT';
  private readonly FIND_REPORT_BY_ID = 'FIND_REPORT_BY_ID';
  private readonly FIND_REPORT_BY_CONDOMINIUM = 'FIND_REPORT_BY_CONDOMINIUM';
  private readonly FIND_REPORT_BY_APARTMENT = 'FIND_REPORT_BY_APARTMENT';
  private readonly FIND_REPORT_BY_USER = 'FIND_REPORT_BY_USER';
  private readonly FIND_REPORT_BY_PAYMENT = 'FIND_REPORT_BY_PAYMENT';


  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly condominiumService: CondominiumService,
    private readonly paymentService :PaymentsService,
   private readonly maintenanceFeeService: MaintenanceFeesService,
  ) {}
  
  generatePdf(res: Response, data: any): void {
    const doc = new PDFDocument();

    // Configurar la respuesta para enviar el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

    // Generar contenido del PDF
    doc.text('Reporte de Condominio', { align: 'center' });
    doc.moveDown();
    doc.text(`Nombre: ${data.name}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.text(`Descripción: ${data.description}`);
    doc.moveDown();
    doc.text('Gracias por usar nuestra aplicación.', { align: 'center' });

    // Finalizar el documento y enviarlo
    doc.pipe(res);
    doc.end();
  }


  async generateAccountStatement(res: Response, condominiumId: string): Promise<void> {
    const doc = new PDFDocument();

    // Configurar la respuesta para enviar el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=account-statement.pdf');

    const condominium = await this.condominiumService.findOne(condominiumId);

   
      // Calcular el rango de fechas para el mes
      const startDate = new Date(Date.UTC(2025,5 -1, 1, 0, 0, 0, 0));  // Primer día del mes
      const endDate =   new Date(Date.UTC(2025, 5, 0, 23, 59, 59, 999)); // Último día del mes

     // Obtener cuotas de los últimos 30 días
      this.logger.debug(`Fecha de inicio: ${startDate.toISOString()}`);
      this.logger.debug(`Fecha de fin: ${endDate.toISOString()}`);
      const maintenanceFee = await this.maintenanceFeeService.getMaintenanceByStartDate(
        condominiumId,startDate,endDate);

      this.logger.debug(`Cuota de mantenimiento: ${JSON.stringify(maintenanceFee)}`);
    // Obtener los pagos realizados asociados a las cuotas de mantenimiento
    const payments = await this.paymentService.findAllbyCondominiumMantenanceFee(
      condominiumId,
      maintenanceFee._id.toString());


    // Generar contenido del PDF
    doc.fontSize(16).text('Estado de Cuenta - Condominio', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Condominio ID: ${condominium.name}`);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Detalle de cuotas de mantenimiento
    doc.fontSize(14).text('Cuotas de Mantenimiento:', { underline: true });
   
      doc
        .fontSize(12)
        .text(`- Detalle: ${maintenanceFee.detail}, Monto: $${maintenanceFee.amount}, Fecha límite: ${maintenanceFee.paymentDeadline}`);
 
    doc.moveDown();

    // Detalle de pagos realizados
    doc.fontSize(14).text('Pagos Realizados:', { underline: true });
    let total=0;
    let pending=0;
    let confirmed=0;
    payments.forEach((payment) => {

      //enum: ['PENDING', 'CONFIRMED', 'CANCELED', 'REFUNDED'],
      this.logger.debug(`Pago: ${JSON.stringify(payment)}`);
      if (payment.status === ACTIVE && payment.paymentStatus === 'CONFIRMED') {
        confirmed += payment.amount;
      }
      if (payment.status === ACTIVE && payment.paymentStatus === 'PENDING') {
        pending += payment.amount;
      }
      total += payment.amount;

      doc
        .fontSize(12)
        .text(`-Depto ${payment.apartmentId['name']}  Monto: $${payment.amount}, Fecha: ${payment.paymentDate}, Método: ${payment.paymentMethod}`);
    });
    doc.moveDown();
    doc.fontSize(14).text(`Total Pagado: $${total}`, { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Total Pendiente: $${pending}`, { underline: true });

    doc.moveDown();
    doc.fontSize(14).text(`Total Confirmado: $${confirmed}`, { underline: true });
    // Finalizar el documento y enviarlo
    doc.text('Gracias por usar nuestra aplicación.', { align: 'center' });
    doc.pipe(res);
    doc.end();
  }
  async
  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  findAll() {
    return `This action returns all reports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
