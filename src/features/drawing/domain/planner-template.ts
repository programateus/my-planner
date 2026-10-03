export const PLANNER_TEMPLATES = [
  {
    id: "daily",
    label: "Diário",
    description: "Prioridades, horários, tarefas e notas para o dia.",
  },
  {
    id: "weekly",
    label: "Semanal",
    description: "Sete dias, foco da semana e espaço para anotações.",
  },
  {
    id: "monthly",
    label: "Mensal",
    description: "Calendário sem datas, metas e lembretes do mês.",
  },
] as const;

export type PlannerTemplateId = (typeof PLANNER_TEMPLATES)[number]["id"];
export type PageTemplates = Readonly<Partial<Record<number, PlannerTemplateId>>>;
