import { Injectable } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { QuotesService } from '../quotes/quotes.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class OnboardingService {
  private static readonly WELCOME_CONTENT = {
    headline:
      'Todo lo que necesitás para manejar tu negocio freelance, en un solo lugar',
    pillars: [
      {
        id: 'crm',
        title: 'CRM de clientes',
        description:
          'Centralizá contactos, notas y el historial de cada cliente.',
        icon: 'group',
        route: '/app/clients',
      },
      {
        id: 'projects-tasks',
        title: 'Proyectos y tareas',
        description:
          'Organizá el trabajo en tableros Kanban con columnas personalizables.',
        icon: 'account_tree',
        route: '/app/projects',
      },
      {
        id: 'finance',
        title: 'Finanzas, presupuestos y cuotas',
        description:
          'Cotizá, facturá y llevá las cuotas recurrentes de cada cliente, con los totales vinculados a cada proyecto.',
        icon: 'payments',
        route: '/app/finance',
      },
      {
        id: 'time-tracking',
        title: 'Time tracking',
        description:
          'Registrá horas por proyecto con un timer o carga manual, y facturalas con precisión.',
        icon: 'schedule',
        route: '/app/time-tracking',
      },
    ],
  };

  constructor(
    private readonly clientsService: ClientsService,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly quotesService: QuotesService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  getWelcomeContent() {
    return OnboardingService.WELCOME_CONTENT;
  }

  async seedDemoData(workspaceId: string) {
    const existing = await this.clientsService.findDemo(workspaceId);
    if (existing.data.length > 0) {
      return { alreadySeeded: true };
    }

    const client = await this.clientsService.create(workspaceId, {
      name: 'Ejemplo: Estudio Creativo SA',
      email: 'cliente-ejemplo@example.com',
      isDemo: true,
    } as any);

    const project = await this.projectsService.create(workspaceId, {
      name: 'Ejemplo: Rediseño de sitio web',
      clientId: (client._id as any).toString(),
      isDemo: true,
    } as any);

    const projectId = (project._id as any).toString();
    const [taskOne, taskTwo] = await Promise.all([
      this.tasksService.create(workspaceId, {
        title: 'Ejemplo: Diseñar wireframes',
        projectId,
        isDemo: true,
      } as any),
      this.tasksService.create(workspaceId, {
        title: 'Ejemplo: Configurar hosting',
        projectId,
        isDemo: true,
      } as any),
    ]);

    const clientId = (client._id as any).toString();
    const [quote, subscription] = await Promise.all([
      this.quotesService.create(workspaceId, {
        title: 'Ejemplo: Presupuesto rediseño web',
        number: 'DEMO-001',
        clientId,
        projectId,
        status: 'sent',
        items: [
          {
            description: 'Diseño y desarrollo',
            quantity: 1,
            unitPrice: 5000,
            amount: 5000,
          },
        ],
        currency: 'USD',
        isDemo: true,
      } as any),
      this.subscriptionsService.create(workspaceId, {
        clientId,
        planName: 'Ejemplo: Mantenimiento mensual',
        price: 500,
        currency: 'USD',
        billingCycle: 'monthly',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isDemo: true,
      } as any),
    ]);

    return { alreadySeeded: false, client, project, tasks: [taskOne, taskTwo], quote, subscription };
  }

  async clearDemoData(workspaceId: string) {
    const [clients, projects, tasks, quotes, subscriptions] = await Promise.all([
      this.clientsService.findDemo(workspaceId),
      this.projectsService.findDemo(workspaceId),
      this.tasksService.findDemo(workspaceId),
      this.quotesService.findDemo(workspaceId),
      this.subscriptionsService.findDemo(workspaceId),
    ]);

    await Promise.all([
      ...clients.data.map((c: any) =>
        this.clientsService.remove(workspaceId, c._id.toString()),
      ),
      ...projects.data.map((p: any) =>
        this.projectsService.remove(workspaceId, p._id.toString()),
      ),
      ...tasks.data.map((t: any) =>
        this.tasksService.remove(workspaceId, t._id.toString()),
      ),
      ...quotes.data.map((q: any) =>
        this.quotesService.remove(workspaceId, q._id.toString()),
      ),
      ...subscriptions.data.map((s: any) =>
        this.subscriptionsService.remove(workspaceId, s._id.toString()),
      ),
    ]);

    return {
      removed:
        clients.data.length +
        projects.data.length +
        tasks.data.length +
        quotes.data.length +
        subscriptions.data.length,
    };
  }
}
