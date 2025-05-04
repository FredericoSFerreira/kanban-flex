import {Briefcase, Calendar, ClipboardList, Code, Rocket, SquareKanban, Target} from "lucide-vue-next";
import {useAuthStore} from '@/stores/auth'
import uniqueId from "@/utils/uuid.js";
import {i18n} from '@/i18n/index'

const {t} = i18n.global


const configDefault = {
  showLike: false,
  showVisibility: false,
  showAuthorCard: false,
  showTitle: true,
  showDescription: true,
  showTags: true,
}

type Template = {
  id: number,
  type: string,
  icon: any,
  title: string,
  config: object,
  columns: Array<object>
}

function getTemplateBlank(): Template {
  return {
    id: 0,
    type: 'blank',
    icon: '',
    title: `${t('templates.name')} - ${t('templates.types.blankBoard.name')}`,
    config: configDefault,
    columns: []
  }
}

export function getTemplates(): Array<Template> {
  return [
    {
      id: 1,
      type: 'projectManagement',
      icon: Briefcase,
      title: `${t('templates.name')} - ${t('templates.types.projectManagement.name')}`,
      config: configDefault,
      columns: [
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.projectManagement.columns.first')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.projectManagement.columns.second')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.projectManagement.columns.third')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.projectManagement.columns.fourth')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.projectManagement.columns.fifth')}`
        }
      ]
    },
    {
      id: 2,
      type: 'developmentSprint',
      icon: Code,
      title: `${t('templates.name')} - ${t('templates.types.developmentSprint.name')}`,
      config: configDefault,
      columns: [
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.developmentSprint.columns.first')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.developmentSprint.columns.second')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.developmentSprint.columns.third')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.developmentSprint.columns.fourth')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.developmentSprint.columns.fifth')}`
        }
      ]
    },
    {
      id: 3,
      type: 'okrTracking',
      icon: Target,
      title: `${t('templates.name')} - ${t('templates.types.okrTracking.name')}`,
      config: configDefault,
      columns: [
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.okrTracking.columns.first')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.okrTracking.columns.second')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.okrTracking.columns.third')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.okrTracking.columns.fourth')}`
        },
      ]
    },
    {
      id: 4,
      type: 'contentCalendar',
      icon: Calendar,
      title: `${t('templates.name')} - ${t('templates.types.contentCalendar.name')}`,
      config: configDefault,
      columns: [

        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.contentCalendar.columns.first')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.contentCalendar.columns.second')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.contentCalendar.columns.third')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.contentCalendar.columns.fourth')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.contentCalendar.columns.fifth')}`
        }
      ]
    },
    {
      id: 5,
      type: 'bugTracking',
      icon: ClipboardList,
      title: `${t('templates.name')} - ${t('templates.types.bugTracking.name')}`,
      config: configDefault,
      columns: [
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.bugTracking.columns.first')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.bugTracking.columns.second')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.bugTracking.columns.third')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.bugTracking.columns.fourth')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.bugTracking.columns.fifth')}`
        }
      ]
    },
    {
      id: 6,
      type: 'productLaunch',
      icon: Rocket,
      title: `${t('templates.name')} - ${t('templates.types.productLaunch.name')}`,
      config: configDefault,
      columns: [
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.productLaunch.columns.first')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.productLaunch.columns.second')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.productLaunch.columns.third')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.productLaunch.columns.fourth')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.productLaunch.columns.fifth')}`
        }
      ]
    },
    {
      id: 7,
      type: 'sprintRetrospective',
      icon: SquareKanban,
      title: `${t('templates.name')} - ${t('templates.types.sprintRetrospective.name')}`,
      config: {...configDefault, showLike: true, showVisibility: true, showAuthorCard: true},
      columns: [
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.sprintRetrospective.columns.first')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.sprintRetrospective.columns.second')}`
        },
        {
          id: uniqueId(),
          itens: [],
          name: `${t('templates.types.sprintRetrospective.columns.third')}`
        }
      ]
    },
  ]
}


export function getTemplate(id: number): object {
  const auth = useAuthStore()
  const template: Template | undefined = id === 0 ? getTemplateBlank() : getTemplates().find(template => template.id === id)
  return {
    name: template?.title,
    owner: auth.user?.name,
    visibility: true,
    owner_id: auth.user?.id,
    owner_email: auth.user?.email,
    config: template?.config,
    columns: template?.columns
  }
}
