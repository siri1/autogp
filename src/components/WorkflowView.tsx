"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PhoneCall,
  CalendarPlus,
  CarFront,
  Search,
  FileText,
  CheckSquare,
  Wrench,
  ShieldCheck,
  Receipt,
  Banknote,
  ChevronRight,
  ArrowRight,
  Circle,
  CheckCircle2,
  Clock,
  Info,
  Car,
  User,
  Package,
  BookOpen,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface StageMeta {
  id: string;
  step: number;
  icon: React.ElementType;
  color: string;
  moduleView: string;
  moduleIcon: React.ElementType;
  integrationKeys: string[];  // keys into MODULE_NAMES
  docFormat?: string;
}

interface StageContent {
  title: string;
  subtitle: string;
  moduleName: string;
  inputs: string[];
  outputs: string[];
  actions: string[];
  statusLabel: string;
}

interface SampleVehicle {
  plate: string;
  customer: string;
  make: string;
  model: string;
  service: string;
  stageId: string;
  elapsed: string;
  amount?: string;
}

interface WorkflowViewProps {
  onNavigate: (view: string) => void;
}

// ── Static meta (language-independent) ────────────────────────────────────

const STAGE_META: StageMeta[] = [
  { id: 'reception', step: 1, icon: PhoneCall,    color: 'sky',     moduleView: 'appointments', moduleIcon: CalendarPlus, integrationKeys: ['crm', 'vehicles'] },
  { id: 'checkin',   step: 2, icon: CarFront,     color: 'violet',  moduleView: 'appointments', moduleIcon: CalendarPlus, integrationKeys: ['vehicles'] },
  { id: 'diagnosis', step: 3, icon: Search,       color: 'amber',   moduleView: 'in-service',   moduleIcon: Car,          integrationKeys: ['parts', 'vehicles'] },
  { id: 'quotation', step: 4, icon: FileText,     color: 'orange',  moduleView: 'quotations',   moduleIcon: ClipboardList, integrationKeys: ['parts', 'accounting'], docFormat: 'QT-YYYYMM-XXXX' },
  { id: 'approval',  step: 5, icon: CheckSquare,  color: 'lime',    moduleView: 'quotations',   moduleIcon: ClipboardList, integrationKeys: [] },
  { id: 'job',       step: 6, icon: Wrench,       color: 'blue',    moduleView: 'quotations',   moduleIcon: ClipboardList, integrationKeys: ['parts', 'in-service', 'clocking'], docFormat: 'JOB-YYYYMM-XXXX' },
  { id: 'qc',        step: 7, icon: ShieldCheck,  color: 'purple',  moduleView: 'in-service',   moduleIcon: Car,          integrationKeys: ['quotations'] },
  { id: 'invoicing', step: 8, icon: Receipt,      color: 'emerald', moduleView: 'quotations',   moduleIcon: ClipboardList, integrationKeys: ['accounting'], docFormat: 'INV-YYYYMM-XXXX' },
  { id: 'payment',   step: 9, icon: Banknote,     color: 'teal',    moduleView: 'accounting',   moduleIcon: BookOpen,     integrationKeys: ['vehicles', 'kpis'] },
];

// ── Translated stage content ───────────────────────────────────────────────

type StageMap = Record<string, StageContent>;

const STAGE_CONTENT: Record<Language, StageMap> = {
  en: {
    reception: {
      title: 'Reception',
      subtitle: 'Customer contact & appointment',
      moduleName: 'Appointment Booking',
      inputs:  ['Customer phone / walk-in / online request', 'Service type requested', 'Preferred date & time'],
      outputs: ['Appointment record (APT-YYYYMM-XXXX)', 'CRM customer profile created / matched'],
      actions: ['Identify or create customer in CRM', 'Select vehicle from Vehicle Database (or register new)', 'Choose service type, preferred technician, duration', 'Assign workshop bay', 'Set appointment status → Scheduled'],
      statusLabel: 'Appointment: Scheduled',
    },
    checkin: {
      title: 'Vehicle Check-In',
      subtitle: 'Physical vehicle arrival & confirmation',
      moduleName: 'Appointment Booking',
      inputs:  ['Customer arrives with vehicle', 'Appointment record'],
      outputs: ['Confirmed appointment', 'Updated vehicle mileage', 'Vehicle linked to service bay'],
      actions: ['Verify customer identity and vehicle registration', 'Record current mileage in Vehicle Database', 'Note pre-existing damage (handover condition)', 'Confirm appointment → status In Progress', 'Assign / confirm bay number'],
      statusLabel: 'Appointment: Confirmed → In Progress',
    },
    diagnosis: {
      title: 'Diagnosis',
      subtitle: 'Technician assessment on bay',
      moduleName: 'Vehicles In Service',
      inputs:  ['Vehicle on assigned bay', 'Customer-reported complaint', 'Vehicle service history'],
      outputs: ['Fault report', 'Parts list required', 'Estimated labour hours'],
      actions: ['Vehicle stage set to On-Bay', 'Technician performs diagnostic scan / visual inspection', 'Stage advanced to Diagnosis', 'Identify required parts and check stock in Parts Inventory', 'Estimate labour hours and record findings'],
      statusLabel: 'Vehicle: On-Bay → Diagnosis',
    },
    quotation: {
      title: 'Quotation',
      subtitle: 'Cost estimate prepared & sent',
      moduleName: 'Quotations & Jobs',
      inputs:  ['Diagnostic findings', 'Parts list + cost prices', 'Labour hours × rate'],
      outputs: ['Quotation PDF (QT-YYYYMM-XXXX)', 'Line items: labour + parts', 'Subtotal + 14 % VAT + Total'],
      actions: ['Open New Quotation in Quotations & Jobs', 'Add labour line items (hours × hourly rate)', 'Add parts line items (from Parts Inventory pricing)', 'VAT (IVA 14 %) calculated automatically', 'Save as Draft → review → Send to customer'],
      statusLabel: 'Quotation: Draft → Sent',
    },
    approval: {
      title: 'Customer Approval',
      subtitle: 'Quotation accepted or declined',
      moduleName: 'Quotations & Jobs',
      inputs:  ['Sent quotation', 'Customer decision'],
      outputs: ['Approved quotation (proceed to job)', 'Or rejected quotation (re-quote / close)'],
      actions: ['Customer reviews PDF quotation', 'Service Advisor records decision in system', 'Approved → quotation status set to Approved', 'Rejected → record reason, optionally re-negotiate or cancel', 'Approved quotation is locked against further editing'],
      statusLabel: 'Quotation: Sent → Approved / Rejected',
    },
    job: {
      title: 'Job Execution',
      subtitle: 'Work order opened, work performed',
      moduleName: 'Quotations & Jobs',
      inputs:  ['Approved quotation', 'Assigned technician', 'Parts from inventory'],
      outputs: ['Job Card (JOB-YYYYMM-XXXX)', 'Parts consumed from stock', 'Labour hours logged'],
      actions: ['Click Convert to Job on the approved quotation', 'Job Card created (JOB-YYYYMM-XXXX) with technician assignment', 'Parts issued from Parts Inventory (stock levels decremented)', 'Technician clocks on job (Clocking module)', 'Job status: Pending → In Progress', 'Additional work discovered? Create supplement quotation'],
      statusLabel: 'Job: Pending → In Progress',
    },
    qc: {
      title: 'Quality Control',
      subtitle: 'Inspection, washing & sign-off',
      moduleName: 'Vehicles In Service',
      inputs:  ['Completed work', 'Job Card checklist'],
      outputs: ['QC-passed vehicle', 'Washed vehicle ready for handover'],
      actions: ['Technician advances vehicle stage: On-Bay → Quality Control', 'Supervisor or QC technician inspects work against job card', 'Any rework: stage returned to On-Bay', 'Pass QC: stage advanced to Washing', 'After wash: stage set to Waiting for Collection', 'Customer notified vehicle is ready'],
      statusLabel: 'Vehicle: Quality Control → Washing',
    },
    invoicing: {
      title: 'Invoicing',
      subtitle: 'Invoice generated & sent to customer',
      moduleName: 'Quotations & Jobs',
      inputs:  ['Completed Job Card', 'Final parts & labour totals'],
      outputs: ['Invoice PDF (INV-YYYYMM-XXXX)', 'Journal entry posted to Chart of Accounts', 'Accounts Receivable debited', 'Revenue & VAT accounts credited'],
      actions: ['Mark job status as Completed', 'Click Generate Invoice on the job', 'Invoice (INV-YYYYMM-XXXX) created from job line items', 'PDF invoice exported and sent to customer', 'Journal entries auto-generated (Debit A/R, Credit Revenue + VAT)', 'Invoice status: Sent'],
      statusLabel: 'Job: Completed → Invoiced',
    },
    payment: {
      title: 'Payment & Close',
      subtitle: 'Payment collected, books reconciled',
      moduleName: 'Chart of Accounts',
      inputs:  ['Sent invoice', 'Customer payment (cash / transfer / card)'],
      outputs: ['Invoice marked Paid', 'Journal entry: Dr Cash/Bank, Cr Accounts Receivable', 'Service record added to vehicle history', 'KPI metrics updated'],
      actions: ['Record payment in Chart of Accounts → Invoices tab', 'Select payment method (cash, bank transfer, card)', 'System posts closing journal entry automatically', 'Invoice status: Paid, balance → 0', 'Vehicle service record finalised in Vehicle Database', 'Workshop KPIs refreshed (revenue, technician efficiency)'],
      statusLabel: 'Invoice: Sent → Paid',
    },
  },

  pt: {
    reception: {
      title: 'Recepção',
      subtitle: 'Contacto do cliente e marcação',
      moduleName: 'Marcações',
      inputs:  ['Contacto por telefone / presencial / online', 'Tipo de serviço solicitado', 'Data e hora preferidas'],
      outputs: ['Registo de marcação (APT-AAAAMM-XXXX)', 'Perfil de cliente no CRM criado / associado'],
      actions: ['Identificar ou criar cliente no CRM', 'Selecionar veículo na Base de Dados de Veículos (ou registar novo)', 'Escolher tipo de serviço, técnico preferido, duração', 'Atribuir bancada de oficina', 'Definir estado da marcação → Agendado'],
      statusLabel: 'Marcação: Agendada',
    },
    checkin: {
      title: 'Entrada do Veículo',
      subtitle: 'Chegada física do veículo e confirmação',
      moduleName: 'Marcações',
      inputs:  ['Cliente chega com o veículo', 'Registo de marcação'],
      outputs: ['Marcação confirmada', 'Quilometragem do veículo actualizada', 'Veículo associado à bancada de serviço'],
      actions: ['Verificar identidade do cliente e matrícula do veículo', 'Registar quilometragem actual na Base de Dados de Veículos', 'Anotar danos pré-existentes (condição na entrega)', 'Confirmar marcação → estado Em Progresso', 'Atribuir / confirmar número de bancada'],
      statusLabel: 'Marcação: Confirmada → Em Progresso',
    },
    diagnosis: {
      title: 'Diagnóstico',
      subtitle: 'Avaliação do técnico na bancada',
      moduleName: 'Veículos em Serviço',
      inputs:  ['Veículo na bancada atribuída', 'Reclamação reportada pelo cliente', 'Histórico de serviço do veículo'],
      outputs: ['Relatório de avarias', 'Lista de peças necessárias', 'Horas de mão-de-obra estimadas'],
      actions: ['Fase do veículo definida como Na Bancada', 'Técnico realiza diagnóstico electrónico / inspecção visual', 'Fase avançada para Diagnóstico', 'Identificar peças necessárias e verificar stock no Inventário', 'Estimar horas de trabalho e registar conclusões'],
      statusLabel: 'Veículo: Na Bancada → Diagnóstico',
    },
    quotation: {
      title: 'Orçamento',
      subtitle: 'Estimativa de custo preparada e enviada',
      moduleName: 'Orçamentos e Trabalhos',
      inputs:  ['Resultados do diagnóstico', 'Lista de peças + preços de custo', 'Horas de trabalho × tarifa'],
      outputs: ['PDF do Orçamento (QT-AAAAMM-XXXX)', 'Itens: mão-de-obra + peças', 'Subtotal + IVA 14 % + Total'],
      actions: ['Abrir Novo Orçamento em Orçamentos e Trabalhos', 'Adicionar itens de mão-de-obra (horas × tarifa horária)', 'Adicionar itens de peças (a partir do preço do Inventário)', 'IVA (14 %) calculado automaticamente', 'Guardar como Rascunho → rever → Enviar ao cliente'],
      statusLabel: 'Orçamento: Rascunho → Enviado',
    },
    approval: {
      title: 'Aprovação do Cliente',
      subtitle: 'Orçamento aceite ou recusado',
      moduleName: 'Orçamentos e Trabalhos',
      inputs:  ['Orçamento enviado', 'Decisão do cliente'],
      outputs: ['Orçamento aprovado (avançar para trabalho)', 'Ou orçamento recusado (re-orçamentar / fechar)'],
      actions: ['Cliente revê o orçamento em PDF', 'Consultor de serviço regista a decisão no sistema', 'Aprovado → estado do orçamento definido como Aprovado', 'Recusado → registar motivo, re-negociar ou cancelar', 'Orçamento aprovado fica bloqueado para edição'],
      statusLabel: 'Orçamento: Enviado → Aprovado / Recusado',
    },
    job: {
      title: 'Execução do Trabalho',
      subtitle: 'Ordem de trabalho aberta, trabalho realizado',
      moduleName: 'Orçamentos e Trabalhos',
      inputs:  ['Orçamento aprovado', 'Técnico atribuído', 'Peças do inventário'],
      outputs: ['Ficha de Trabalho (JOB-AAAAMM-XXXX)', 'Peças consumidas do stock', 'Horas de mão-de-obra registadas'],
      actions: ['Clicar em Converter para Trabalho no orçamento aprovado', 'Ficha de Trabalho criada (JOB-AAAAMM-XXXX) com técnico atribuído', 'Peças emitidas do Inventário (níveis de stock decrementados)', 'Técnico regista entrada no trabalho (módulo de Ponto)', 'Estado do trabalho: Pendente → Em Progresso', 'Trabalho adicional descoberto? Criar orçamento suplementar'],
      statusLabel: 'Trabalho: Pendente → Em Progresso',
    },
    qc: {
      title: 'Controlo de Qualidade',
      subtitle: 'Inspecção, lavagem e aprovação final',
      moduleName: 'Veículos em Serviço',
      inputs:  ['Trabalho concluído', 'Lista de verificação da Ficha de Trabalho'],
      outputs: ['Veículo aprovado no CQ', 'Veículo lavado pronto para entrega'],
      actions: ['Técnico avança fase do veículo: Na Bancada → Controlo de Qualidade', 'Supervisor ou técnico de CQ inspecciona trabalho contra ficha', 'Qualquer retrabalho: fase retorna a Na Bancada', 'Passa CQ: fase avança para Lavagem', 'Após lavagem: fase definida como Aguardando Recolha', 'Cliente notificado que o veículo está pronto'],
      statusLabel: 'Veículo: Controlo de Qualidade → Lavagem',
    },
    invoicing: {
      title: 'Facturação',
      subtitle: 'Factura gerada e enviada ao cliente',
      moduleName: 'Orçamentos e Trabalhos',
      inputs:  ['Ficha de Trabalho concluída', 'Totais finais de peças e mão-de-obra'],
      outputs: ['PDF da Factura (INV-AAAAMM-XXXX)', 'Lançamento contabilístico registado no Plano de Contas', 'Débito em Contas a Receber', 'Crédito em contas de Receita e IVA'],
      actions: ['Marcar estado do trabalho como Concluído', 'Clicar em Gerar Factura no trabalho', 'Factura (INV-AAAAMM-XXXX) criada a partir dos itens do trabalho', 'Factura PDF exportada e enviada ao cliente', 'Lançamentos contabilísticos gerados automaticamente (Débito C/R, Crédito Receita + IVA)', 'Estado da factura: Enviada'],
      statusLabel: 'Trabalho: Concluído → Facturado',
    },
    payment: {
      title: 'Pagamento e Encerramento',
      subtitle: 'Pagamento recebido, contabilidade reconciliada',
      moduleName: 'Plano de Contas',
      inputs:  ['Factura enviada', 'Pagamento do cliente (numerário / transferência / cartão)'],
      outputs: ['Factura marcada como Paga', 'Lançamento: Débito Caixa/Banco, Crédito Contas a Receber', 'Registo de serviço adicionado ao histórico do veículo', 'Métricas de KPI actualizadas'],
      actions: ['Registar pagamento no Plano de Contas → separador Facturas', 'Seleccionar método de pagamento (numerário, transferência, cartão)', 'Sistema regista lançamento de encerramento automaticamente', 'Estado da factura: Paga, saldo → 0', 'Registo de serviço do veículo finalizado na Base de Dados', 'KPIs da oficina actualizados (receita, eficiência técnica)'],
      statusLabel: 'Factura: Enviada → Paga',
    },
  },

  es: {
    reception: {
      title: 'Recepción',
      subtitle: 'Contacto del cliente y cita',
      moduleName: 'Citas',
      inputs:  ['Contacto por teléfono / presencial / online', 'Tipo de servicio solicitado', 'Fecha y hora preferidas'],
      outputs: ['Registro de cita (APT-AAAAMM-XXXX)', 'Perfil de cliente en CRM creado / asociado'],
      actions: ['Identificar o crear cliente en CRM', 'Seleccionar vehículo en la Base de Datos (o registrar nuevo)', 'Elegir tipo de servicio, técnico preferido, duración', 'Asignar puesto de taller', 'Establecer estado de cita → Programado'],
      statusLabel: 'Cita: Programada',
    },
    checkin: {
      title: 'Recepción del Vehículo',
      subtitle: 'Llegada física del vehículo y confirmación',
      moduleName: 'Citas',
      inputs:  ['Cliente llega con el vehículo', 'Registro de cita'],
      outputs: ['Cita confirmada', 'Kilometraje del vehículo actualizado', 'Vehículo asignado al puesto de servicio'],
      actions: ['Verificar identidad del cliente y matrícula del vehículo', 'Registrar kilometraje actual en la Base de Datos de Vehículos', 'Anotar daños preexistentes (condición en la entrega)', 'Confirmar cita → estado En Progreso', 'Asignar / confirmar número de puesto'],
      statusLabel: 'Cita: Confirmada → En Progreso',
    },
    diagnosis: {
      title: 'Diagnóstico',
      subtitle: 'Evaluación del técnico en el puesto',
      moduleName: 'Vehículos En Servicio',
      inputs:  ['Vehículo en el puesto asignado', 'Queja reportada por el cliente', 'Historial de servicio del vehículo'],
      outputs: ['Informe de fallos', 'Lista de piezas requeridas', 'Horas de mano de obra estimadas'],
      actions: ['Fase del vehículo establecida como En Puesto', 'Técnico realiza diagnóstico electrónico / inspección visual', 'Fase avanzada a Diagnóstico', 'Identificar piezas requeridas y verificar stock en Inventario', 'Estimar horas de trabajo y registrar hallazgos'],
      statusLabel: 'Vehículo: En Puesto → Diagnóstico',
    },
    quotation: {
      title: 'Presupuesto',
      subtitle: 'Estimación de costos preparada y enviada',
      moduleName: 'Presupuestos y Trabajos',
      inputs:  ['Resultados del diagnóstico', 'Lista de piezas + precios de coste', 'Horas de trabajo × tarifa'],
      outputs: ['PDF del Presupuesto (QT-AAAAMM-XXXX)', 'Partidas: mano de obra + piezas', 'Subtotal + IVA 14 % + Total'],
      actions: ['Abrir Nuevo Presupuesto en Presupuestos y Trabajos', 'Agregar partidas de mano de obra (horas × tarifa horaria)', 'Agregar partidas de piezas (desde precios del Inventario)', 'IVA (14 %) calculado automáticamente', 'Guardar como Borrador → revisar → Enviar al cliente'],
      statusLabel: 'Presupuesto: Borrador → Enviado',
    },
    approval: {
      title: 'Aprobación del Cliente',
      subtitle: 'Presupuesto aceptado o rechazado',
      moduleName: 'Presupuestos y Trabajos',
      inputs:  ['Presupuesto enviado', 'Decisión del cliente'],
      outputs: ['Presupuesto aprobado (proceder al trabajo)', 'O presupuesto rechazado (re-cotizar / cerrar)'],
      actions: ['Cliente revisa el presupuesto en PDF', 'Asesor de servicio registra la decisión en el sistema', 'Aprobado → estado del presupuesto establecido como Aprobado', 'Rechazado → registrar motivo, re-negociar o cancelar', 'Presupuesto aprobado queda bloqueado para edición'],
      statusLabel: 'Presupuesto: Enviado → Aprobado / Rechazado',
    },
    job: {
      title: 'Ejecución del Trabajo',
      subtitle: 'Orden de trabajo abierta, trabajo realizado',
      moduleName: 'Presupuestos y Trabajos',
      inputs:  ['Presupuesto aprobado', 'Técnico asignado', 'Piezas del inventario'],
      outputs: ['Ficha de Trabajo (JOB-AAAAMM-XXXX)', 'Piezas consumidas del stock', 'Horas de trabajo registradas'],
      actions: ['Hacer clic en Convertir a Trabajo en el presupuesto aprobado', 'Ficha de Trabajo creada (JOB-AAAAMM-XXXX) con técnico asignado', 'Piezas emitidas del Inventario (niveles de stock decrementados)', 'Técnico registra entrada en el trabajo (módulo de Fichaje)', 'Estado del trabajo: Pendiente → En Progreso', '¿Trabajo adicional descubierto? Crear presupuesto suplementario'],
      statusLabel: 'Trabajo: Pendiente → En Progreso',
    },
    qc: {
      title: 'Control de Calidad',
      subtitle: 'Inspección, lavado y aprobación final',
      moduleName: 'Vehículos En Servicio',
      inputs:  ['Trabajo completado', 'Lista de verificación de la Ficha de Trabajo'],
      outputs: ['Vehículo aprobado en CC', 'Vehículo lavado listo para entrega'],
      actions: ['Técnico avanza fase del vehículo: En Puesto → Control de Calidad', 'Supervisor o técnico de CC inspecciona trabajo contra ficha', 'Cualquier retrabajo: fase regresa a En Puesto', 'Pasa CC: fase avanza a Lavado', 'Tras el lavado: fase establecida como Esperando Recogida', 'Cliente notificado que el vehículo está listo'],
      statusLabel: 'Vehículo: Control de Calidad → Lavado',
    },
    invoicing: {
      title: 'Facturación',
      subtitle: 'Factura generada y enviada al cliente',
      moduleName: 'Presupuestos y Trabajos',
      inputs:  ['Ficha de Trabajo completada', 'Totales finales de piezas y mano de obra'],
      outputs: ['PDF de la Factura (INV-AAAAMM-XXXX)', 'Asiento contable registrado en el Plan de Cuentas', 'Débito en Cuentas por Cobrar', 'Crédito en cuentas de Ingresos e IVA'],
      actions: ['Marcar estado del trabajo como Completado', 'Hacer clic en Generar Factura en el trabajo', 'Factura (INV-AAAAMM-XXXX) creada desde las partidas del trabajo', 'Factura PDF exportada y enviada al cliente', 'Asientos contables generados automáticamente (Débito C/C, Crédito Ingresos + IVA)', 'Estado de la factura: Enviada'],
      statusLabel: 'Trabajo: Completado → Facturado',
    },
    payment: {
      title: 'Pago y Cierre',
      subtitle: 'Pago recibido, contabilidad reconciliada',
      moduleName: 'Plan de Cuentas',
      inputs:  ['Factura enviada', 'Pago del cliente (efectivo / transferencia / tarjeta)'],
      outputs: ['Factura marcada como Pagada', 'Asiento: Débito Efectivo/Banco, Crédito Cuentas por Cobrar', 'Registro de servicio añadido al historial del vehículo', 'Métricas de KPI actualizadas'],
      actions: ['Registrar pago en el Plan de Cuentas → pestaña Facturas', 'Seleccionar método de pago (efectivo, transferencia, tarjeta)', 'El sistema registra el asiento de cierre automáticamente', 'Estado de la factura: Pagada, saldo → 0', 'Registro de servicio del vehículo finalizado en la Base de Datos', 'KPIs del taller actualizados (ingresos, eficiencia del técnico)'],
      statusLabel: 'Factura: Enviada → Pagada',
    },
  },

  zh: {
    reception: {
      title: '接待',
      subtitle: '客户联系与预约',
      moduleName: '预约管理',
      inputs:  ['电话/到访/在线请求', '请求的服务类型', '偏好日期和时间'],
      outputs: ['预约记录 (APT-YYYYMM-XXXX)', 'CRM客户档案已创建/匹配'],
      actions: ['在CRM中识别或创建客户', '从车辆数据库选择车辆（或注册新车辆）', '选择服务类型、首选技师、工时', '分配工位', '设置预约状态→已排班'],
      statusLabel: '预约：已排班',
    },
    checkin: {
      title: '车辆登记',
      subtitle: '车辆实际到达与确认',
      moduleName: '预约管理',
      inputs:  ['客户携车到达', '预约记录'],
      outputs: ['预约已确认', '车辆里程已更新', '车辆已分配至工位'],
      actions: ['核实客户身份和车牌号', '在车辆数据库中记录当前里程', '记录预存损坏情况（交接状态）', '确认预约→状态改为进行中', '分配/确认工位编号'],
      statusLabel: '预约：已确认→进行中',
    },
    diagnosis: {
      title: '诊断',
      subtitle: '技师在工位进行评估',
      moduleName: '在修车辆',
      inputs:  ['车辆在指定工位', '客户报告的故障', '车辆维修历史'],
      outputs: ['故障报告', '所需零件清单', '预估工时'],
      actions: ['设置车辆阶段为在工位', '技师进行诊断扫描/目视检查', '阶段推进至诊断', '确认所需零件并检查库存', '估算工时并记录结果'],
      statusLabel: '车辆：在工位→诊断',
    },
    quotation: {
      title: '报价',
      subtitle: '成本估算准备并发送',
      moduleName: '报价与工单',
      inputs:  ['诊断结果', '零件清单+成本价', '工时×费率'],
      outputs: ['报价PDF (QT-YYYYMM-XXXX)', '明细：工时+零件', '小计 + 14% 增值税 + 合计'],
      actions: ['在报价与工单中打开新报价', '添加工时明细（工时×小时费率）', '添加零件明细（来自库存定价）', 'IVA（14%）自动计算', '保存为草稿→审核→发送给客户'],
      statusLabel: '报价：草稿→已发送',
    },
    approval: {
      title: '客户审批',
      subtitle: '报价被接受或拒绝',
      moduleName: '报价与工单',
      inputs:  ['已发送的报价', '客户决定'],
      outputs: ['已批准报价（进入工单）', '或被拒绝报价（重新报价/关闭）'],
      actions: ['客户审阅PDF报价', '服务顾问在系统中记录决定', '已批准→报价状态设为已批准', '已拒绝→记录原因，可选择重新谈判或取消', '已批准的报价锁定，不可再编辑'],
      statusLabel: '报价：已发送→已批准/已拒绝',
    },
    job: {
      title: '工单执行',
      subtitle: '工单开启，开始作业',
      moduleName: '报价与工单',
      inputs:  ['已批准报价', '已分配技师', '库存零件'],
      outputs: ['工单 (JOB-YYYYMM-XXXX)', '已从库存领用零件', '已记录工时'],
      actions: ['在已批准报价上点击"转为工单"', '工单已创建（JOB-YYYYMM-XXXX），技师已分配', '从库存领用零件（库存数量递减）', '技师在工单上打卡（考勤模块）', '工单状态：待处理→进行中', '发现额外工作？创建补充报价'],
      statusLabel: '工单：待处理→进行中',
    },
    qc: {
      title: '质量控制',
      subtitle: '检验、清洗与最终确认',
      moduleName: '在修车辆',
      inputs:  ['已完成工作', '工单检查清单'],
      outputs: ['已通过质检的车辆', '已清洗车辆，等待交付'],
      actions: ['技师推进车辆阶段：在工位→质量控制', '主管或质检技师对照工单检查工作', '如需返工：阶段返回至在工位', '通过质检：阶段推进至清洗', '清洗完成：阶段设为等待取车', '通知客户车辆已就绪'],
      statusLabel: '车辆：质量控制→清洗',
    },
    invoicing: {
      title: '开票',
      subtitle: '发票生成并发送给客户',
      moduleName: '报价与工单',
      inputs:  ['已完成工单', '零件与工时最终合计'],
      outputs: ['发票PDF (INV-YYYYMM-XXXX)', '会计分录已过账至科目表', '应收账款借记', '收入及增值税账户贷记'],
      actions: ['将工单状态标记为已完成', '在工单上点击"生成发票"', '从工单明细创建发票（INV-YYYYMM-XXXX）', 'PDF发票已导出并发送给客户', '自动生成会计分录（借记应收账款，贷记收入+增值税）', '发票状态：已发送'],
      statusLabel: '工单：已完成→已开票',
    },
    payment: {
      title: '收款与结算',
      subtitle: '收取付款，账目核对',
      moduleName: '科目表',
      inputs:  ['已发送发票', '客户付款（现金/转账/刷卡）'],
      outputs: ['发票标记为已付款', '会计分录：借记现金/银行，贷记应收账款', '服务记录已添加至车辆历史', 'KPI指标已更新'],
      actions: ['在科目表→发票选项卡中记录付款', '选择付款方式（现金、银行转账、刷卡）', '系统自动过账结账分录', '发票状态：已付款，余额→0', '车辆服务记录在数据库中完结', '工作坊KPI已刷新（收入、技师效率）'],
      statusLabel: '发票：已发送→已付款',
    },
  },

  fr: {
    reception: {
      title: 'Réception',
      subtitle: 'Contact client et rendez-vous',
      moduleName: 'Rendez-vous',
      inputs:  ['Contact par téléphone / en personne / en ligne', 'Type de service demandé', 'Date et heure souhaitées'],
      outputs: ['Enregistrement de rendez-vous (APT-AAAAMM-XXXX)', 'Profil client CRM créé / associé'],
      actions: ["Identifier ou créer le client dans le CRM", "Sélectionner le véhicule dans la base de données (ou en enregistrer un nouveau)", "Choisir le type de service, le technicien préféré, la durée", "Attribuer un poste d'atelier", "Définir le statut du rendez-vous → Planifié"],
      statusLabel: 'Rendez-vous: Planifié',
    },
    checkin: {
      title: 'Réception du Véhicule',
      subtitle: 'Arrivée physique du véhicule et confirmation',
      moduleName: 'Rendez-vous',
      inputs:  ['Le client arrive avec le véhicule', 'Enregistrement de rendez-vous'],
      outputs: ['Rendez-vous confirmé', 'Kilométrage du véhicule mis à jour', 'Véhicule lié au poste de service'],
      actions: ["Vérifier l'identité du client et l'immatriculation du véhicule", "Enregistrer le kilométrage actuel dans la base de données des véhicules", "Noter les dommages préexistants (état à la remise)", "Confirmer le rendez-vous → statut En cours", "Attribuer / confirmer le numéro de poste"],
      statusLabel: 'Rendez-vous: Confirmé → En cours',
    },
    diagnosis: {
      title: 'Diagnostic',
      subtitle: 'Évaluation du technicien sur le poste',
      moduleName: 'Véhicules En Service',
      inputs:  ['Véhicule sur le poste attribué', 'Réclamation signalée par le client', "Historique d'entretien du véhicule"],
      outputs: ['Rapport de panne', 'Liste des pièces requises', "Heures de main-d'œuvre estimées"],
      actions: ["Étape du véhicule définie sur Sur poste", "Le technicien effectue un scan de diagnostic / inspection visuelle", "Étape avancée à Diagnostic", "Identifier les pièces requises et vérifier le stock dans l'inventaire", "Estimer les heures de travail et enregistrer les résultats"],
      statusLabel: 'Véhicule: Sur poste → Diagnostic',
    },
    quotation: {
      title: 'Devis',
      subtitle: 'Estimation des coûts préparée et envoyée',
      moduleName: 'Devis et Travaux',
      inputs:  ['Résultats du diagnostic', 'Liste des pièces + prix de revient', "Heures de travail × taux"],
      outputs: ['PDF du Devis (QT-AAAAMM-XXXX)', "Lignes: main-d'œuvre + pièces", 'Sous-total + TVA 14 % + Total'],
      actions: ["Ouvrir un Nouveau Devis dans Devis et Travaux", "Ajouter les lignes de main-d'œuvre (heures × taux horaire)", "Ajouter les lignes de pièces (depuis les prix de l'inventaire)", "TVA (IVA 14 %) calculée automatiquement", "Enregistrer comme Brouillon → réviser → Envoyer au client"],
      statusLabel: 'Devis: Brouillon → Envoyé',
    },
    approval: {
      title: 'Approbation Client',
      subtitle: 'Devis accepté ou refusé',
      moduleName: 'Devis et Travaux',
      inputs:  ['Devis envoyé', 'Décision du client'],
      outputs: ['Devis approuvé (procéder au travail)', 'Ou devis rejeté (re-devis / clôture)'],
      actions: ["Le client examine le devis PDF", "Le conseiller service enregistre la décision dans le système", "Approuvé → statut du devis défini sur Approuvé", "Rejeté → enregistrer la raison, éventuellement re-négocier ou annuler", "Le devis approuvé est verrouillé contre toute modification ultérieure"],
      statusLabel: 'Devis: Envoyé → Approuvé / Rejeté',
    },
    job: {
      title: 'Exécution du Travail',
      subtitle: 'Bon de travail ouvert, travail effectué',
      moduleName: 'Devis et Travaux',
      inputs:  ['Devis approuvé', 'Technicien assigné', "Pièces de l'inventaire"],
      outputs: ["Bon de Travail (JOB-AAAAMM-XXXX)", "Pièces consommées du stock", "Heures de travail enregistrées"],
      actions: ["Cliquer sur Convertir en Travail sur le devis approuvé", "Bon de Travail créé (JOB-AAAAMM-XXXX) avec affectation du technicien", "Pièces émises depuis l'inventaire (niveaux de stock décrémentés)", "Le technicien pointe sur le travail (module de Pointage)", "Statut du travail: En attente → En cours", "Travail supplémentaire découvert? Créer un devis complémentaire"],
      statusLabel: 'Travail: En attente → En cours',
    },
    qc: {
      title: 'Contrôle Qualité',
      subtitle: 'Inspection, lavage et validation finale',
      moduleName: 'Véhicules En Service',
      inputs:  ['Travail terminé', 'Liste de contrôle du Bon de Travail'],
      outputs: ['Véhicule validé par le CQ', 'Véhicule lavé prêt pour la remise'],
      actions: ["Le technicien fait avancer l'étape du véhicule: Sur poste → Contrôle Qualité", "Le superviseur ou technicien CQ inspecte le travail par rapport au bon", "Tout retravail: étape renvoyée à Sur poste", "Passe CQ: étape avancée à Lavage", "Après lavage: étape définie sur En attente de récupération", "Client notifié que le véhicule est prêt"],
      statusLabel: 'Véhicule: Contrôle Qualité → Lavage',
    },
    invoicing: {
      title: 'Facturation',
      subtitle: 'Facture générée et envoyée au client',
      moduleName: 'Devis et Travaux',
      inputs:  ['Bon de Travail terminé', "Totaux finaux des pièces et de la main-d'œuvre"],
      outputs: ["PDF de la Facture (INV-AAAAMM-XXXX)", "Écriture comptable enregistrée dans le Plan Comptable", "Débit des Comptes Clients", "Crédit des comptes Revenus et TVA"],
      actions: ["Marquer le statut du travail comme Terminé", "Cliquer sur Générer la Facture sur le travail", "Facture (INV-AAAAMM-XXXX) créée à partir des lignes du travail", "Facture PDF exportée et envoyée au client", "Écritures comptables générées automatiquement (Débit C/C, Crédit Revenus + TVA)", "Statut de la facture: Envoyée"],
      statusLabel: 'Travail: Terminé → Facturé',
    },
    payment: {
      title: 'Paiement et Clôture',
      subtitle: "Paiement reçu, comptabilité réconciliée",
      moduleName: 'Plan Comptable',
      inputs:  ['Facture envoyée', 'Paiement du client (espèces / virement / carte)'],
      outputs: ["Facture marquée comme Payée", "Écriture: Débit Caisse/Banque, Crédit Comptes Clients", "Enregistrement du service ajouté à l'historique du véhicule", "Indicateurs KPI mis à jour"],
      actions: ["Enregistrer le paiement dans le Plan Comptable → onglet Factures", "Sélectionner le mode de paiement (espèces, virement, carte)", "Le système enregistre l'écriture de clôture automatiquement", "Statut de la facture: Payée, solde → 0", "Dossier de service du véhicule finalisé dans la base de données", "KPIs de l'atelier mis à jour (revenus, efficacité des techniciens)"],
      statusLabel: 'Facture: Envoyée → Payée',
    },
  },
};

// ── Sample pipeline data (customer names stay as-is — realistic Angolan data) ──

const SAMPLE_PIPELINE: SampleVehicle[] = [
  { plate: 'LD-12-34-AB', customer: 'João Silva',    make: 'Toyota',       model: 'Hilux',       service: 'Full Service',        stageId: 'job',       elapsed: '2h 15m', amount: '145,600 AOA' },
  { plate: 'LD-56-78-CD', customer: 'Maria Santos',  make: 'Mercedes-Benz',model: 'E220d',       service: 'Brake Overhaul',      stageId: 'qc',        elapsed: '4h 50m', amount: '320,000 AOA' },
  { plate: 'LD-99-10-EF', customer: 'Carlos Mendes', make: 'Toyota',       model: 'Land Cruiser',service: 'Suspension Repair',   stageId: 'diagnosis', elapsed: '45m' },
  { plate: 'LD-23-45-GH', customer: 'Ana Rodrigues', make: 'Mitsubishi',   model: 'Pajero',      service: 'Engine Diagnostic',   stageId: 'quotation', elapsed: '1h 30m', amount: '87,500 AOA' },
  { plate: 'LD-67-89-IJ', customer: 'Pedro Costa',   make: 'Ford',         model: 'Ranger',      service: 'Gearbox Service',     stageId: 'approval',  elapsed: '3h 00m', amount: '456,200 AOA' },
  { plate: 'LD-11-22-KL', customer: 'Sofia Lima',    make: 'Nissan',       model: 'Navara',      service: 'AC Recharge',         stageId: 'invoicing', elapsed: '5h 10m', amount: '65,000 AOA' },
  { plate: 'LD-33-44-MN', customer: 'Rui Ferreira',  make: 'Land Rover',   model: 'Discovery',   service: 'Oil & Filter Change', stageId: 'checkin',   elapsed: '10m' },
  { plate: 'LD-55-66-OP', customer: 'Beatriz Neto',  make: 'BMW',          model: 'X5',          service: 'Electrical Fault',    stageId: 'reception', elapsed: 'Booked' },
];

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; badge: string; pipelineBg: string }> = {
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     badge: 'bg-sky-100 text-sky-700',       pipelineBg: 'bg-sky-500' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700', pipelineBg: 'bg-violet-500' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700',   pipelineBg: 'bg-amber-500' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  badge: 'bg-orange-100 text-orange-700', pipelineBg: 'bg-orange-500' },
  lime:    { bg: 'bg-lime-50',    text: 'text-lime-700',    border: 'border-lime-200',     badge: 'bg-lime-100 text-lime-700',    pipelineBg: 'bg-lime-500' },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',     badge: 'bg-blue-100 text-blue-700',    pipelineBg: 'bg-blue-600' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  badge: 'bg-purple-100 text-purple-700', pipelineBg: 'bg-purple-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', pipelineBg: 'bg-emerald-600' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',     badge: 'bg-teal-100 text-teal-700',    pipelineBg: 'bg-teal-600' },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function WorkflowView({ onNavigate }: WorkflowViewProps) {
  const { t, language } = useLanguage();
  const [selectedStageId, setSelectedStageId] = useState<string>('reception');

  const content = STAGE_CONTENT[language];
  const meta = STAGE_META.find(s => s.id === selectedStageId)!;
  const stage = content[selectedStageId];
  const c = COLOR_CLASSES[meta.color];
  const Icon = meta.icon;

  const vehiclesAtStage = SAMPLE_PIPELINE.filter(v => v.stageId === selectedStageId);
  const totalActive = SAMPLE_PIPELINE.length;

  // Module links shown in the right-hand sidebar
  const MODULE_LINKS = [
    { label: t.navAppointments, view: 'appointments', Icon: CalendarPlus },
    { label: t.navInService,    view: 'in-service',   Icon: Car },
    { label: t.navQuotations,   view: 'quotations',   Icon: ClipboardList },
    { label: t.navParts,        view: 'parts',        Icon: Package },
    { label: t.navAccounting,   view: 'accounting',   Icon: BookOpen },
    { label: t.navKpis,         view: 'kpis',         Icon: BarChart3 },
  ];

  // Resolve integration keys to translated names
  const MODULE_NAME_MAP: Record<string, string> = {
    crm:        t.navCustomers,
    vehicles:   t.navVehicles,
    parts:      t.navParts,
    accounting: t.navAccounting,
    'in-service': t.navInService,
    quotations: t.navQuotations,
    clocking:   t.navClocking,
    kpis:       t.navKpis,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">{t.wfTitle}</h1>
        <p className="text-slate-600 mt-2">
          {t.wfSubtitle} — {totalActive} {t.wfVehiclesActiveToday}
        </p>
      </div>

      {/* Pipeline strip */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="flex min-w-max">
              {STAGE_META.map((s, idx) => {
                const cc = COLOR_CLASSES[s.color];
                const SIcon = s.icon;
                const stageContent = content[s.id];
                const count = SAMPLE_PIPELINE.filter(v => v.stageId === s.id).length;
                const isActive = s.id === selectedStageId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStageId(s.id)}
                    className={`relative flex flex-col items-center px-4 py-4 min-w-[120px] transition-all group
                      ${isActive ? `${cc.bg} border-b-4 ${cc.border.replace('border-', 'border-b-')}` : 'bg-white hover:bg-slate-50 border-b-4 border-b-transparent'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                      ${isActive ? cc.pipelineBg + ' text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                    `}>
                      <SIcon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-semibold text-center leading-tight
                      ${isActive ? cc.text : 'text-slate-600'}
                    `}>{stageContent.title}</span>
                    {count > 0 && (
                      <span className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${cc.badge}`}>
                        {count}
                      </span>
                    )}
                    {idx < STAGE_META.length - 1 && (
                      <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Colour progress bar */}
          <div className="h-1 bg-slate-100 flex">
            {STAGE_META.map(s => {
              const cc = COLOR_CLASSES[s.color];
              return (
                <div key={s.id} className={`flex-1 transition-all ${s.id === selectedStageId ? cc.pipelineBg : 'bg-transparent'}`} />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Stage detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card className={`border-2 ${c.border}`}>
            <CardHeader className={`${c.bg} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 ${c.pipelineBg} rounded-xl text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${c.text} opacity-70`}>
                      {t.wfColStep} {meta.step} {t.wfOf} {STAGE_META.length}
                    </p>
                    <CardTitle className={`text-xl ${c.text}`}>{stage.title}</CardTitle>
                    <p className="text-sm text-slate-600">{stage.subtitle}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className={`${c.pipelineBg} text-white hover:opacity-90`}
                  onClick={() => onNavigate(meta.moduleView)}
                >
                  {t.wfOpen} {stage.moduleName}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">

              {/* Inputs / Outputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                    <Info className="h-3 w-3" /> {t.wfInputs}
                  </h4>
                  <ul className="space-y-1">
                    {stage.inputs.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <Circle className="h-2 w-2 mt-1.5 flex-shrink-0 text-slate-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {t.wfOutputs}
                  </h4>
                  <ul className="space-y-1">
                    {stage.outputs.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" /> {t.wfStepByStep}
                </h4>
                <ol className="space-y-2">
                  {stage.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full ${c.bg} ${c.text} text-xs font-bold flex items-center justify-center mt-0.5`}>
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Footer: document format + integrations */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                {meta.docFormat && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">{t.wfDocument}:</span>
                    <code className={`px-2 py-0.5 rounded text-xs font-mono ${c.badge}`}>{meta.docFormat}</code>
                  </div>
                )}
                {meta.integrationKeys.length > 0 && (
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="text-slate-500">{t.wfAlsoTouches}:</span>
                    {meta.integrationKeys.map(key => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {MODULE_NAME_MAP[key] ?? key}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prev / Next navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.step === 1}
              onClick={() => setSelectedStageId(STAGE_META[meta.step - 2].id)}
            >
              ← {t.wfPrevious}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.step === STAGE_META.length}
              onClick={() => setSelectedStageId(STAGE_META[meta.step].id)}
            >
              {t.wfNext} →
            </Button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Vehicles at this stage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Car className="h-4 w-4 text-slate-500" />
                {t.wfVehiclesAtStage}
                {vehiclesAtStage.length > 0 && (
                  <Badge className={`ml-auto ${c.badge}`}>{vehiclesAtStage.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehiclesAtStage.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">{t.wfNoVehicles}</p>
              ) : (
                vehiclesAtStage.map(v => (
                  <div key={v.plate} className={`p-3 rounded-lg border ${c.border} ${c.bg} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{v.plate}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{v.elapsed}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{v.make} {v.model} — {v.service}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <User className="h-3 w-3" />{v.customer}
                      </span>
                      {v.amount && (
                        <span className={`text-xs font-semibold ${c.text}`}>{v.amount}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Live pipeline summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-500" />
                {t.wfLivePipeline} ({totalActive})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {STAGE_META.map(s => {
                const count = SAMPLE_PIPELINE.filter(v => v.stageId === s.id).length;
                if (count === 0) return null;
                const cc = COLOR_CLASSES[s.color];
                const SIcon = s.icon;
                const sc = content[s.id];
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStageId(s.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all
                      ${s.id === selectedStageId ? `${cc.bg} ${cc.border} border` : 'hover:bg-slate-50'}
                    `}
                  >
                    <div className={`p-1.5 rounded-md ${cc.pipelineBg} text-white`}>
                      <SIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs text-slate-700 flex-1">{sc.title}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cc.badge}`}>{count}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Module quick links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t.wfSystemModules}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {MODULE_LINKS.map(({ label, view, Icon: MIcon }) => (
                <button
                  key={view}
                  onClick={() => onNavigate(view)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-700 transition-all"
                >
                  <MIcon className="h-4 w-4 text-slate-400" />
                  {label}
                  <ArrowRight className="h-3 w-3 ml-auto text-slate-300" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full reference table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.wfReferenceTitle}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">{t.wfColStep}</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">{t.wfColStage}</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">{t.wfColModule}</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">{t.wfDocument}</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">{t.wfColStatus}</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {STAGE_META.map(s => {
                const cc = COLOR_CLASSES[s.color];
                const SIcon = s.icon;
                const sc = content[s.id];
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStageId(s.id)}
                    className={`border-b border-slate-100 cursor-pointer transition-all
                      ${s.id === selectedStageId ? cc.bg : 'hover:bg-slate-50'}
                    `}
                  >
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${cc.pipelineBg} text-white`}>
                        {s.step}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <SIcon className={`h-4 w-4 ${cc.text}`} />
                        <span className="font-medium text-slate-800">{sc.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{sc.moduleName}</td>
                    <td className="py-2.5 px-3">
                      {s.docFormat ? (
                        <code className={`px-2 py-0.5 rounded text-xs font-mono ${cc.badge}`}>{s.docFormat}</code>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-xs">{sc.statusLabel}</td>
                    <td className="py-2.5 px-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={e => { e.stopPropagation(); onNavigate(s.moduleView); }}
                      >
                        {t.wfOpen} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
