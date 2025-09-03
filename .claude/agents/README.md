# Claude Code Agents Directory Structure

This directory contains sub-agent definitions organized by type and purpose, including BMAD (Business Method Agile Development) agents for structured development workflows. Each agent has specific capabilities, tool restrictions, and naming conventions that trigger automatic delegation.

## Directory Structure

```
.claude/agents/
├── README.md                    # This file
├── bmad-orchestrator.md         # BMAD Master orchestrator agent
├── bmad-master.md               # BMAD workflow master agent
├── _templates/                  # Agent templates
│   ├── base-agent.yaml
│   └── agent-types.md
├── development/                 # Development agents
│   ├── backend/
│   ├── frontend/
│   ├── fullstack/
│   └── api/
├── testing/                     # Testing agents
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── performance/
├── architecture/                # Architecture agents
│   ├── system-design/
│   ├── database/
│   ├── cloud/
│   └── security/
├── devops/                      # DevOps agents
│   ├── ci-cd/
│   ├── infrastructure/
│   ├── monitoring/
│   └── deployment/
├── documentation/               # Documentation agents
│   ├── api-docs/
│   ├── user-guides/
│   ├── technical/
│   └── readme/
├── analysis/                    # Analysis agents
│   ├── code-review/
│   ├── performance/
│   ├── security/
│   └── refactoring/
├── data/                        # Data agents
│   ├── etl/
│   ├── analytics/
│   ├── ml/
│   └── visualization/
└── specialized/                 # Specialized agents
    ├── mobile/
    ├── embedded/
    ├── blockchain/
    └── ai-ml/
```

## BMAD Method Integration

This project includes the **BMAD (Business Method Agile Development)** system for structured AI-driven development workflows. BMAD provides specialized agents and workflows for comprehensive project management.

### BMAD Agents

#### BMad Orchestrator (`/bmad-orchestrator`)

- **Role**: Master coordinator and method expert
- **Use Cases**: Workflow coordination, multi-agent tasks, role switching guidance
- **Capabilities**: Transforms into any specialized agent, loads resources on-demand
- **When to Use**: Complex projects requiring orchestrated agent coordination

#### BMad Master (`/bmad-master`)

- **Role**: Comprehensive workflow management
- **Use Cases**: Any task that other agents can do (except story implementation)
- **Capabilities**: Full BMAD method access, knowledge base integration
- **When to Use**: Single-agent approach for development lifecycle management

### BMAD System Components

The BMAD system is located in `.bmad-core/` and includes:

- **10 Specialized Agents**: analyst, architect, pm, po, dev, sm, qa, ux-expert
- **6 Workflows**: greenfield/brownfield for fullstack, service, and UI development
- **23 Executable Tasks**: Granular development and quality assurance workflows
- **13 Templates**: Professional document generation (PRDs, architecture, stories)
- **6 Quality Checklists**: Comprehensive validation frameworks

### BMAD Development Workflow

BMAD follows a structured two-phase approach:

#### Phase 1: Planning (Web UI or Powerful IDE)

1. **Analyst**: Market research, competitive analysis, project brief
2. **Product Manager**: PRD creation with features and requirements
3. **UX Expert**: Frontend specifications and UI prompts
4. **Architect**: System architecture from PRD + UX specs
5. **Product Owner**: Master checklist validation and document sharding

#### Phase 2: Development (IDE)

1. **Scrum Master**: Story drafting from epics and architecture
2. **QA**: Risk assessment and test strategy (optional)
3. **Product Owner**: Story validation (optional)
4. **Developer**: Sequential task execution with tests
5. **QA**: Quality gates and comprehensive review
6. **Continuous**: Commit changes and iterate

### BMAD Commands

```bash
# Agent Activation
/bmad-orchestrator    # Master coordinator
/bmad-master         # Workflow master

# Via Task Tool
Task("BMAD Orchestrator", "Coordinate full-stack development", "bmad-orchestrator")
Task("Product Manager", "Create PRD", "pm")
Task("UX Expert", "Design interface", "ux-expert")
Task("Developer", "Implement feature", "dev")
Task("QA", "Quality review", "qa")
```

### Quality Assurance with BMAD

BMAD includes a comprehensive Test Architect (QA agent) with specialized commands:

- `*risk` - Risk assessment before development
- `*design` - Test strategy creation
- `*trace` - Requirements tracing during development
- `*nfr` - Non-functional requirements validation
- `*review` - Comprehensive quality assessment
- `*gate` - Quality gate management

## Naming Conventions

Agent files follow this naming pattern:
`[type]-[specialization]-[capability].agent.yaml`

Examples:

- `dev-backend-api.agent.yaml`
- `test-unit-jest.agent.yaml`
- `arch-cloud-aws.agent.yaml`
- `docs-api-openapi.agent.yaml`

BMAD agents use command format:

- `/bmad-orchestrator`
- `/bmad-master`

## Automatic Delegation Triggers

Claude Code automatically delegates to agents based on:

1. **Keywords in user request**: "test", "deploy", "document", "review", "bmad", "orchestrate"
2. **File patterns**: `*.test.js` → testing agent, `*.tf` → infrastructure agent, `docs/prd.md` → BMAD agents
3. **Task complexity**: Multi-step tasks spawn BMAD orchestrator or coordinator agents
4. **Domain detection**: Database queries → data agent, API endpoints → backend agent, project planning → BMAD agents

## Tool Restrictions

Each agent type has specific tool access:

- **Development agents**: Full file system access, code execution
- **Testing agents**: Test runners, coverage tools, limited write access
- **Architecture agents**: Read-only access, diagram generation
- **Documentation agents**: Markdown tools, read access, limited write to docs/
- **DevOps agents**: Infrastructure tools, deployment scripts, environment access
- **Analysis agents**: Read-only access, static analysis tools
- **BMAD agents**: Full project access, document generation, workflow orchestration, quality gates

## BMAD Configuration

BMAD system configuration is managed through:

- **Core Config**: `.bmad-core/core-config.yaml`
- **Agent Teams**: `.bmad-core/agent-teams/` (team-all, team-fullstack, etc.)
- **Workflows**: `.bmad-core/workflows/` (greenfield/brownfield patterns)
- **Templates**: `.bmad-core/templates/` (PRD, architecture, story templates)
- **Tasks**: `.bmad-core/tasks/` (executable workflow steps)

## Getting Started with BMAD

1. **Activate Orchestrator**: Use `/bmad-orchestrator` for project guidance
2. **Choose Workflow**: Select appropriate greenfield or brownfield pattern
3. **Execute Planning**: Run analyst → PM → UX → architect sequence
4. **Begin Development**: Use SM → dev → QA cycle for implementation
5. **Quality Gates**: Leverage built-in quality assurance throughout

For detailed BMAD usage, see the comprehensive workflows in `.bmad-core/workflows/` and user guide in `.bmad-core/user-guide.md`.
