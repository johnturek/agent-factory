/**
 * Agent Factory - Generator
 * Transforms Agent Factory spec YAML → Copilot Studio template YAML
 * 
 * Based on actual extracted template from Copilot Studio (pac copilot extract-template)
 */

const yaml = require('js-yaml');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate Copilot Studio template from Agent Factory spec
 */
function generate(spec, options = {}) {
  const botId = uuidv4();
  const componentId = uuidv4();
  const prefix = options.prefix || 'af'; // Publisher prefix
  
  // Build the BotDefinition
  const template = {
    kind: 'BotDefinition',
    environmentId: options.environmentId || '00000000-0000-0000-0000-000000000000',
    entity: {
      managedProperties: {
        isCustomizable: false
      },
      displayName: spec.name,
      schemaName: `${prefix}_${sanitizeSchemaName(spec.name)}`,
      componentIdUnique: componentId,
      cdsBotId: uuidv4(),
      accessControlPolicy: 'ChatbotReaders',
      authenticationMode: spec.security?.authentication?.mode || 'Integrated',
      authenticationTrigger: 'Always',
      configuration: {
        settings: {
          GenerativeActionsEnabled: spec.capabilities?.includes('generative_actions') ?? true
        },
        botSpeechSettings: {
          isDomainLanguageModelEnabled: false
        }
      },
      synchronizationStatus: {
        contentVersion: 1,
        currentSynchronizationState: {
          provisioningStatus: 'NotProvisioned',
          state: 'NotStarted'
        }
      },
      template: 'default-2.1.0',
      language: languageToCode(spec.metadata?.language || 'en-US'),
      runtimeProvider: 'PowerVirtualAgents',
      state: 'Active',
      status: 1
    },
    components: []
  };
  
  // Add GPT instructions component
  if (spec.instructions) {
    template.components.push({
      kind: 'LegacyOrUnknownComponent',
      managedProperties: { isCustomizable: false },
      displayName: spec.name,
      parentBotId: botId,
      shareContext: {},
      state: 'Active',
      status: 'Active',
      componentTypeInt: 15,
      schemaName: `${prefix}_${sanitizeSchemaName(spec.name)}_gpt_default`,
      data: yaml.dump({
        kind: 'GptComponentMetadata',
        instructions: spec.instructions,
        gptCapabilities: {}
      })
    });
  }
  
  // Add system topics
  template.components.push(...generateSystemTopics(botId, spec, prefix));
  
  // Add custom topics from spec
  if (spec.topics) {
    for (const topic of spec.topics) {
      template.components.push(generateTopic(botId, topic, spec, prefix));
    }
  }
  
  return yaml.dump(template, { lineWidth: -1, noRefs: true });
}

/**
 * Generate system topics (Greeting, Fallback, etc.)
 */
function generateSystemTopics(botId, spec, prefix) {
  const topics = [];
  
  // Conversation Start
  topics.push({
    kind: 'DialogComponent',
    managedProperties: { isCustomizable: false },
    displayName: 'Conversation Start',
    parentBotId: botId,
    description: 'This system topic triggers when the agent receives an Activity indicating the beginning of a new conversation.',
    shareContext: {},
    state: 'Active',
    status: 'Active',
    schemaName: `${prefix}_topic_ConversationStart`,
    dialog: {
      beginDialog: {
        kind: 'OnConversationStart',
        id: 'main',
        actions: [
          {
            kind: 'SendActivity',
            id: `sendMessage_${randomId()}`,
            activity: {
              text: [spec.greeting || `Hello, I'm ${spec.name}. How can I help you today?`]
            }
          }
        ]
      }
    }
  });
  
  // Greeting
  topics.push({
    kind: 'DialogComponent',
    managedProperties: { isCustomizable: false },
    displayName: 'Greeting',
    parentBotId: botId,
    description: 'This topic is triggered when the user greets the agent.',
    shareContext: {},
    state: 'Active',
    status: 'Active',
    schemaName: `${prefix}_topic_Greeting`,
    dialog: {
      beginDialog: {
        kind: 'OnRecognizedIntent',
        id: 'main',
        intent: {
          displayName: 'Greeting',
          includeInOnSelectIntent: false,
          triggerQueries: ['Good afternoon', 'Good morning', 'Hello', 'Hey', 'Hi']
        },
        actions: [
          {
            kind: 'SendActivity',
            id: `sendMessage_${randomId()}`,
            activity: {
              text: [spec.greeting || 'Hello, how can I help you today?']
            }
          },
          {
            kind: 'CancelAllDialogs',
            id: `cancelAllDialogs_${randomId()}`
          }
        ]
      }
    }
  });
  
  // Fallback
  topics.push({
    kind: 'DialogComponent',
    managedProperties: { isCustomizable: false },
    displayName: 'Fallback',
    parentBotId: botId,
    description: "This system topic triggers when the user's utterance does not match any existing topics.",
    shareContext: {},
    state: 'Active',
    status: 'Active',
    schemaName: `${prefix}_topic_Fallback`,
    dialog: {
      beginDialog: {
        kind: 'OnUnknownIntent',
        id: 'main',
        actions: [
          {
            kind: 'ConditionGroup',
            id: `conditionGroup_${randomId()}`,
            conditions: [
              {
                id: `conditionItem_${randomId()}`,
                condition: '=System.FallbackCount < 3',
                actions: [
                  {
                    kind: 'SendActivity',
                    id: `sendMessage_${randomId()}`,
                    activity: spec.fallbackMessage || "I'm sorry, I'm not sure how to help with that. Can you try rephrasing?"
                  }
                ]
              }
            ],
            elseActions: [
              {
                kind: 'BeginDialog',
                id: randomId(),
                dialog: `${prefix}_topic_Escalate`
              }
            ]
          }
        ]
      }
    }
  });
  
  // Escalate
  topics.push({
    kind: 'DialogComponent',
    managedProperties: { isCustomizable: false },
    displayName: 'Escalate',
    parentBotId: botId,
    description: 'This system topic is triggered when the user indicates they would like to speak to a representative.',
    shareContext: {},
    state: 'Active',
    status: 'Active',
    schemaName: `${prefix}_topic_Escalate`,
    dialog: {
      startBehavior: 'CancelOtherTopics',
      beginDialog: {
        kind: 'OnEscalate',
        id: 'main',
        intent: {
          displayName: 'Escalate',
          includeInOnSelectIntent: false,
          triggerQueries: [
            'Talk to agent', 'Talk to a person', 'Talk to someone',
            'Can I speak to a representative', 'Customer service',
            'I need help from a person', 'Connect me to a live agent'
          ]
        },
        actions: [
          {
            kind: 'SendActivity',
            id: `sendMessage_${randomId()}`,
            conversationOutcome: 'Escalated',
            activity: spec.escalationMessage || 'Escalating to a representative is not currently configured. Is there anything else I can help you with?'
          }
        ]
      }
    }
  });
  
  // Goodbye
  topics.push({
    kind: 'DialogComponent',
    managedProperties: { isCustomizable: false },
    displayName: 'Goodbye',
    parentBotId: botId,
    description: 'This topic triggers when the user says goodbye.',
    shareContext: {},
    state: 'Active',
    status: 'Active',
    schemaName: `${prefix}_topic_Goodbye`,
    dialog: {
      startBehavior: 'CancelOtherTopics',
      beginDialog: {
        kind: 'OnRecognizedIntent',
        id: 'main',
        intent: {
          displayName: 'Goodbye',
          includeInOnSelectIntent: false,
          triggerQueries: ['Bye', 'Bye for now', 'Good bye', 'See you later']
        },
        actions: [
          {
            kind: 'SendActivity',
            id: `sendMessage_${randomId()}`,
            activity: 'Goodbye! Have a great day.'
          },
          {
            kind: 'EndConversation',
            id: `endConversation_${randomId()}`
          }
        ]
      }
    }
  });
  
  // Thank you
  topics.push({
    kind: 'DialogComponent',
    managedProperties: { isCustomizable: false },
    displayName: 'Thank you',
    parentBotId: botId,
    description: 'This topic triggers when the user says thank you.',
    shareContext: {},
    state: 'Active',
    status: 'Active',
    schemaName: `${prefix}_topic_Thankyou`,
    dialog: {
      beginDialog: {
        kind: 'OnRecognizedIntent',
        id: 'main',
        intent: {
          displayName: 'Thank you',
          includeInOnSelectIntent: false,
          triggerQueries: ['thanks', 'thank you', 'thanks so much', 'ty']
        },
        actions: [
          {
            kind: 'SendActivity',
            id: `sendMessage_${randomId()}`,
            activity: "You're welcome."
          }
        ]
      }
    }
  });
  
  // On Error
  topics.push({
    kind: 'DialogComponent',
    managedProperties: { isCustomizable: false },
    displayName: 'On Error',
    parentBotId: botId,
    description: 'This system topic triggers when the agent encounters an error.',
    shareContext: {},
    state: 'Active',
    status: 'Active',
    schemaName: `${prefix}_topic_OnError`,
    dialog: {
      startBehavior: 'UseLatestPublishedContentAndCancelOtherTopics',
      beginDialog: {
        kind: 'OnError',
        id: 'main',
        actions: [
          {
            kind: 'SendActivity',
            id: `sendMessage_${randomId()}`,
            activity: 'An error has occurred. Please try again.'
          },
          {
            kind: 'CancelAllDialogs',
            id: `cancelAllDialogs_${randomId()}`
          }
        ]
      }
    }
  });
  
  return topics;
}

/**
 * Generate a custom topic from spec
 */
function generateTopic(botId, topic, spec, prefix) {
  const schemaName = `${prefix}_topic_${sanitizeSchemaName(topic.name)}`;
  
  const dialogComponent = {
    kind: 'DialogComponent',
    managedProperties: { isCustomizable: false },
    displayName: topic.name,
    parentBotId: botId,
    description: topic.description || '',
    shareContext: {},
    state: 'Active',
    status: 'Active',
    schemaName: schemaName,
    dialog: {
      beginDialog: {
        kind: 'OnRecognizedIntent',
        id: 'main',
        intent: {
          displayName: topic.name,
          includeInOnSelectIntent: false,
          triggerQueries: topic.triggers?.phrases || []
        },
        actions: []
      }
    }
  };
  
  // Convert spec actions to Copilot Studio actions
  if (topic.actions) {
    dialogComponent.dialog.beginDialog.actions = topic.actions.map(action => 
      convertAction(action, spec, prefix)
    );
  }
  
  return dialogComponent;
}

/**
 * Convert Agent Factory action to Copilot Studio action
 */
function convertAction(action, spec, prefix = 'af') {
  switch (action.type) {
    case 'message':
      return {
        kind: 'SendActivity',
        id: `sendMessage_${randomId()}`,
        activity: action.text
      };
      
    case 'question':
      return {
        kind: 'Question',
        id: `question_${randomId()}`,
        variable: `init:Topic.${sanitizeVariableName(action.variable || 'Response')}`,
        prompt: action.prompt,
        entity: mapEntityType(action.entity)
      };
      
    case 'condition':
      return {
        kind: 'ConditionGroup',
        id: `conditionGroup_${randomId()}`,
        conditions: (action.conditions || []).map(cond => ({
          id: `conditionItem_${randomId()}`,
          condition: cond.if,
          actions: (cond.then || []).map(a => convertAction(a, spec, prefix))
        })),
        elseActions: action.else ? action.else.map(a => convertAction(a, spec, prefix)) : []
      };
      
    case 'set_variable':
      return {
        kind: 'SetVariable',
        id: `setVariable_${randomId()}`,
        variable: `init:Topic.${sanitizeVariableName(action.variable)}`,
        value: action.value
      };
      
    case 'call_topic':
      return {
        kind: 'BeginDialog',
        id: randomId(),
        dialog: `${prefix}_topic_${sanitizeSchemaName(action.topic)}`
      };
      
    case 'call_connector':
      return {
        kind: 'InvokeConnectorAction',
        id: `connector_${randomId()}`,
        connectionReference: action.connector,
        operationId: action.operation,
        inputs: action.inputs || {}
      };
      
    case 'call_flow':
      return {
        kind: 'InvokeFlowAction',
        id: `flow_${randomId()}`,
        flowId: action.flow,
        inputs: action.inputs || {}
      };
      
    case 'generative_answer':
      return {
        kind: 'SearchAndSummarizeContent',
        id: `search_${randomId()}`,
        userInput: '=System.Activity.Text',
        variable: 'Topic.Answer'
      };
      
    case 'end_conversation':
      return {
        kind: 'EndConversation',
        id: `endConversation_${randomId()}`
      };
      
    case 'escalate':
      return {
        kind: 'BeginDialog',
        id: randomId(),
        dialog: `${prefix}_topic_Escalate`
      };
      
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return {
        kind: 'SendActivity',
        id: `sendMessage_${randomId()}`,
        activity: `[Unknown action: ${action.type}]`
      };
  }
}

/**
 * Map entity types to Copilot Studio entity names
 */
function mapEntityType(entityType) {
  const mapping = {
    'boolean': 'BooleanPrebuiltEntity',
    'number': 'NumberPrebuiltEntity',
    'date': 'DateTimePrebuiltEntity',
    'email': 'EmailPrebuiltEntity',
    'phone': 'PhoneNumberPrebuiltEntity',
    'string': 'StringPrebuiltEntity',
    'choice': 'ClosedListEntity'
  };
  return mapping[entityType] || 'StringPrebuiltEntity';
}

/**
 * Convert language code to LCID
 */
function languageToCode(lang) {
  const mapping = {
    'en-US': 1033,
    'en-GB': 2057,
    'es-ES': 3082,
    'fr-FR': 1036,
    'de-DE': 1031,
    'ja-JP': 1041,
    'zh-CN': 2052
  };
  return mapping[lang] || 1033;
}

/**
 * Sanitize name for schema
 */
function sanitizeSchemaName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Sanitize variable name
 */
function sanitizeVariableName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Generate random ID (6 chars)
 */
function randomId() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = { generate };
