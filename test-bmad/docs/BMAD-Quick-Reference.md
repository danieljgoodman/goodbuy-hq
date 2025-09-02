# BMAD System Quick Reference Guide

## Instant Activation Commands

### Web UI Activation (Claude, ChatGPT, Gemini)
```
Activate as BMad Orchestrator. Load core configuration and display help menu for Goodbuy HQ e-commerce project development.
```

### IDE Activation (VS Code, Cursor, Claude Code)
```bash
@bmad-orchestrator
"Initialize BMAD system for Goodbuy HQ project development"
```

## Essential Command Cheat Sheet

### Core Orchestrator Commands
```bash
*help                    # Show full command reference
*agent [name]           # Transform into specialized agent
*workflow [name]        # Start structured workflow
*task [name]           # Execute specific task
*checklist [name]      # Load quality checklist
*yolo                  # Toggle rapid processing mode
*status                # Check current system state
*exit                  # Return to orchestrator
```

### Workflow Quick Start
```bash
*workflow-guidance           # Get workflow selection help
*workflow greenfield-fullstack    # New full-stack application
*workflow brownfield-fullstack    # Enhance existing application
*workflow greenfield-service      # New microservice
*workflow greenfield-ui           # New UI component/page
```

### Agent Quick Access
```bash
*agent analyst          # Business analysis and research
*agent pm              # Product requirements and planning
*agent ux-expert       # UI/UX design and specifications
*agent architect       # System architecture and technical design
*agent po              # Product owner, validation, document sharding
*agent sm              # Scrum master, story creation
*agent dev             # Developer, implementation
*agent qa              # Quality assurance, testing
*agent bmad-master     # General purpose agent
```

## Goodbuy HQ Specific Use Cases

### 1. AI Product Recommendations
```bash
*workflow greenfield-fullstack
# Follow guided process through:
# Analyst → PM → UX-Expert → Architect → PO → Document Sharding
```

### 2. Enhanced Search Functionality  
```bash
*workflow brownfield-fullstack
*agent analyst
"Analyze search improvement opportunities for Goodbuy HQ e-commerce platform"
```

### 3. Mobile App Development
```bash
*workflow greenfield-ui
*agent ux-expert
"Design mobile-first shopping experience for Goodbuy HQ"
```

### 4. Payment System Integration
```bash
*workflow greenfield-service
*agent architect
"Design secure payment processing microservice"
```

## Development Workflow Patterns

### Planning Phase (Web UI - Cost Effective)
```
1. *workflow [type]
2. *agent analyst      # Create project brief
3. *agent pm          # Generate PRD with elicitation  
4. *agent ux-expert   # UI/UX specifications
5. *agent architect   # Technical architecture
6. *agent po          # Validation and approval
```

### Development Phase (IDE - Enhanced Tooling)
```
1. @po               # Document sharding
2. @sm *create       # Story generation
3. @dev              # Implementation with tests
4. @qa *review       # Quality assurance
5. Repeat 2-4 for each story
```

## Agent Specialization Guide

### When to Use Each Agent

| Situation | Agent | Command | Expected Output |
|-----------|--------|---------|-----------------|
| Project inception | Analyst | `*agent analyst` | Project brief, market research |
| Feature definition | PM | `*agent pm` | PRD, requirements, epics |
| UI/UX design | UX-Expert | `*agent ux-expert` | UI specs, design prompts |
| Technical architecture | Architect | `*agent architect` | System design, tech stack |
| Document validation | PO | `*agent po` | Quality checks, sharding |
| Story creation | SM | `@sm *create` | User stories, acceptance criteria |
| Code implementation | Dev | `@dev` | Production code with tests |
| Quality assurance | QA | `@qa *review` | Quality gates, test strategies |
| General tasks | BMad-Master | `*agent bmad-master` | Any non-implementation task |

## Quality Gate Quick Commands

### QA Agent Commands
```bash
@qa *risk story-X-X      # Risk assessment
@qa *design story-X-X    # Test design strategy  
@qa *trace story-X-X     # Requirements traceability
@qa *review story-X-X    # Comprehensive quality review
@qa *nfr story-X-X       # Non-functional requirements check
```

### Quality Gate Statuses
- **✅ PASS** - Ready for production
- **⚠️ CONCERNS** - Minor issues, team review recommended  
- **❌ FAIL** - Critical issues, must address before proceeding
- **🔄 WAIVED** - Issues accepted, document reasoning

## Template System Quick Reference

### Available Templates
```bash
*template list                    # Show all templates
*template prd-template-v2        # Product requirements document
*template fullstack-architecture  # System architecture
*template ui-specification       # Frontend specifications  
*template user-story            # Story template
*template quality-checklist     # QA checklists
```

### Template Elicitation Options (1-9 Selection)
```
1. Proceed to next section
2. Stakeholder Interview Simulation
3. Assumption Challenge Method
4. Trade-off Analysis  
5. User Journey Mapping
6. Technical Constraint Exploration
7. Business Impact Assessment
8. Risk-Based Prioritization
9. Competitive Feature Analysis
```

## Claude Code Integration Patterns

### Parallel Agent Spawning
```javascript
// Single message with concurrent agent execution
Task("BMAD Analyst", "Research requirements for [feature]. Store in memory key 'project/analysis'", "analyst")
Task("BMAD Architect", "Design architecture for [feature]. Check memory for analysis", "architect") 
Task("BMAD QA", "Develop test strategy for [feature]. Coordinate via hooks", "qa")

TodoWrite({
  todos: [
    {content: "Research market requirements", status: "in_progress", activeForm: "Researching market requirements"},
    {content: "Design system architecture", status: "in_progress", activeForm: "Designing system architecture"},
    {content: "Create test strategy", status: "in_progress", activeForm: "Creating test strategy"}
  ]
})
```

### Coordination Hooks (Each Agent)
```bash
# Pre-task
npx claude-flow@alpha hooks pre-task --description "[task-description]"

# During work
npx claude-flow@alpha hooks post-edit --file "[file-path]" --memory-key "swarm/[agent]/[step]"

# Post-task  
npx claude-flow@alpha hooks post-task --task-id "[task-id]"
```

## Common Troubleshooting

### Quick Fixes
```bash
# Agent not responding
*status                 # Check current state
*agent bmad-orchestrator # Reset to orchestrator

# Context overflow
@po "Please shard documents"  # Reduce context size
*yolo                  # Enable rapid mode

# Quality gate failures
@qa *trace story-X-X   # Check test coverage
@dev "Address QA concerns from latest review"
```

### Emergency Commands
```bash
*agent bmad-master *task correct-course  # Analyze and correct project issues
*checklist po-master-checklist          # Comprehensive validation
*exit                                   # Return to orchestrator from any agent
```

## Performance Optimization

### Rapid Development Mode
```bash
*yolo                    # Skip confirmation prompts
*task create-stories epic-1 epic-2  # Batch story creation
*workflow [name] --fast  # Skip elicitation where possible
```

### Context Management
```bash
# Efficient file structure
docs/core/              # Always-loaded architecture files
docs/current/           # Active development files
docs/archive/           # Completed work
```

## Success Metrics to Track

### Development Velocity
- Time from concept to working prototype
- Stories completed per sprint
- Quality gate pass rate

### Code Quality  
- Test coverage percentage (target: 85%+)
- Performance benchmarks met
- Security vulnerability count (target: 0 critical)

### Documentation Quality
- Architecture decision records maintained
- Requirements traceability score
- Knowledge transfer effectiveness

## Getting Started Checklist

- [ ] Activate BMad Orchestrator in preferred environment
- [ ] Run `*workflow-guidance` to select appropriate workflow
- [ ] Complete planning phase with structured agent progression
- [ ] Set up IDE environment for development phase
- [ ] Implement coordination hooks for agent communication
- [ ] Establish quality gates and review processes
- [ ] Monitor success metrics and iterate based on results

## Quick Start for Goodbuy HQ Features

### New Feature Development
```bash
1. *workflow greenfield-fullstack
2. *agent analyst "Analyze [feature] requirements for Goodbuy HQ"
3. Follow guided workflow through all planning agents
4. Switch to IDE for implementation
5. @sm *create → @dev → @qa *review cycle
```

### Existing Feature Enhancement  
```bash
1. *workflow brownfield-fullstack
2. *agent analyst "Research enhancement opportunities for [existing-feature]"
3. *agent architect "Design enhancement approach"
4. Direct to story development cycle
```

### Bug Fix or Technical Debt
```bash
1. *agent bmad-master
2. *task analyze-technical-debt
3. *agent dev "Implement fixes with comprehensive tests"
4. @qa *review "Validate fixes and regression coverage"
```

This quick reference provides immediate access to BMAD system capabilities and patterns for efficient Goodbuy HQ project development.