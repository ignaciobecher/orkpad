import { Injectable } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';

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
        route: '/clients',
      },
      {
        id: 'projects-tasks',
        title: 'Proyectos y tareas',
        description:
          'Organizá el trabajo en tableros Kanban con columnas personalizables.',
        icon: 'account_tree',
        route: '/projects',
      },
      {
        id: 'invoicing',
        title: 'Facturas y presupuestos con PDF',
        description:
          'Generá presupuestos, convertilos en facturas y exportá PDFs listos para enviar.',
        icon: 'description',
        route: '/invoices',
      },
      {
        id: 'time-tracking',
        title: 'Time tracking',
        description:
          'Registrá horas por proyecto con un timer o carga manual, y facturalas con precisión.',
        icon: 'schedule',
        route: '/time-tracking',
      },
      {
        id: 'pipeline',
        title: 'Pipeline de oportunidades',
        description:
          'Seguí tus deals desde el primer contacto hasta el cierre.',
        icon: 'trending_up',
        route: '/pipeline',
      },
      {
        id: 'portfolio',
        title: 'Portfolio público',
        description:
          'Publicá tu perfil y proyectos para conseguir nuevos clientes.',
        icon: 'work',
        route: '/portfolio',
      },
      {
        id: 'lead-scraping',
        title: 'Prospección de leads',
        description:
          'Encontrá y organizá potenciales clientes con búsquedas y campañas automatizadas.',
        icon: 'search',
        route: '/leads',
      },
      {
        id: 'messaging',
        title: 'Mensajería',
        description: 'Conversá con tus clientes sin salir de la plataforma.',
        icon: 'chat',
        route: '/messages',
      },
    ],
  };

  constructor(
    private readonly clientsService: ClientsService,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
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

    return { alreadySeeded: false, client, project, tasks: [taskOne, taskTwo] };
  }

  async clearDemoData(workspaceId: string) {
    const [clients, projects, tasks] = await Promise.all([
      this.clientsService.findDemo(workspaceId),
      this.projectsService.findDemo(workspaceId),
      this.tasksService.findDemo(workspaceId),
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
    ]);

    return {
      removed: clients.data.length + projects.data.length + tasks.data.length,
    };
  }
}
