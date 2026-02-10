# Skill: cb4ab0e9 - Resource Competition Framework

**Version**: 1.0.0
**Skill ID**: cb4ab0e9
**Category**: Resource Management
**Last Updated**: 2025-01-10

---

## 1. Description

This skill defines the framework for situations where resources must be obtained through future income streams and competition with peers. It distinguishes these situations from ideal conditions where initial resources are sufficient. Agents must identify when organizations operate under resource competition constraints and apply appropriate protocols for resource acquisition and management.

## 2. Input Data Structure

```yaml
$schema: https://agentskills.io/schemas/resource_competition
type: object
properties:
  resource_id:
    type: string
    pattern: ^[a-f0-9]{8}$
    description: Unique identifier for this resource assessment
  organization_context:
    type: object
    properties:
      organization_id:
        type: string
        description: Organization identifier
        required: true
      organization_name:
        type: string
        description: Organization name
        required: true
    required:
      - organization_id
  resource_status:
    type: string
    enum: [competition_required, resource_sufficient]
    description: Whether resource competition is required
    required: true
  resource_situation_details:
    type: object
    properties:
      initial_resource_availability:
        type: string
        enum: [sufficient, insufficient]
        description: Whether initial resources are sufficient
        required: true
      future_income_dependence:
        type: boolean
        description: Whether future income is required for resources
        required: true
      income_source_type:
        type: string
        enum: [trading, investment, loan, grant, mixed]
        description: Type of future income sources
      competition_level:
        type: string
        enum: [none, low, medium, high, intense]
        description: Level of competition with peers
        required: true
      competitive_landscape:
        type: object
        properties:
          peer_count:
            type: number
            description: Number of competing peers
            minimum: 0
          market_position:
            type: string
            enum: [dominant, strong, average, weak, marginal]
            description: Organization's market position
          competitive_advantages:
            type: array
            items:
              type: string
            description: Specific competitive advantages
          competitive_disadvantages:
            type: array
            items:
              type: string
            description: Specific competitive disadvantages
      resource_gap:
        type: object
        properties:
          current_resources:
            type: number
            description: Currently available resources
          required_resources:
            type: number
            description: Resources required
          gap_amount:
            type: number
            description: Difference between current and required
          gap_percentage:
            type: number
            description: Gap as percentage of required
    required:
      - initial_resource_availability
      - future_income_dependence
      - competition_level
  acquisition_strategy:
    type: object
    properties:
      strategy_type:
        type: string
        enum: [organic_growth, partnership, investment, loan, mixed]
        description: Type of acquisition strategy
        required: true
      competitive_positioning:
        type: string
        description: Planned competitive positioning
      risk_factors:
        type: array
        items:
          type: string
        description: Identified risk factors
      mitigation_measures:
        type: array
        items:
          type: string
        description: Measures to address risks
    required:
      - strategy_type
  alternative_scenario:
    type: object
    properties:
      has_sufficient_initial_resources:
        type: boolean
        description: Whether sufficient initial resources scenario exists
        required: true
      scenario_details:
        type: string
        description: Description of alternative scenario
      comparison_with_current:
        type: string
        description: How alternative compares to current situation
  submitted_by:
    type: string
    description: Identifier of submitting party
    required: true
  submitted_at:
    type: string
    format: date-time
    description: Timestamp of submission
    required: true
```

## 3. Output Data Structure

```yaml
$schema: https://agentskills.io/schemas/resource_competition_validation_result
type: object
properties:
  decision:
    type: string
    enum: [COMPLIANT, IGNORE, CLARIFY]
    description: Compliance decision
  resource_id:
    type: string
    pattern: ^[a-f0-9]{8}$
    description: Reference to resource assessment
  competition_status_identified:
    type: boolean
    description: Whether competition requirement is properly identified
  resource_gap_calculated:
    type: boolean
    description: Whether resource gap is properly quantified
  strategy_defined:
    type: boolean
    description: Whether acquisition strategy is defined
  competitive_positioning_clear:
    type: boolean
    description: Whether competitive positioning is articulated
  findings:
    type: array
    items:
      type: object
      properties:
        severity:
          type: string
          enum: [error, warning, info]
        issue:
          type: string
          description: Identified issue
        recommendation:
          type: string
          description: Recommended action
  metadata:
    type: object
    properties:
      validated_by:
        type: string
        description: Agent ID that performed validation
      validated_at:
        type: string
        format: date-time
        description: Timestamp of validation
      applied_norms:
        type: array
        items:
          type: string
        description: List of skill IDs and versions applied
```

## 4. Error Patterns (Auto-Detection)

### 4.1 Competition Status Unidentified Pattern
```
Pattern: Resource situation without explicit competition status
Detection Rule:
  - Check 'resource_status' is explicitly set
  - Verify 'future_income_dependence' is specified
  - Confirm 'competition_level' is rated
Natural Language Detection:
  "Please explicitly identify whether resource competition is required.
   This is a fundamental categorization for all resource situations."
Response: CLARIFY
```

### 4.2 Insufficient Resources Without Strategy Pattern
```
Pattern: Organization with insufficient resources but no acquisition strategy
Detection Rule:
  - If 'resource_situation_details.initial_resource_availability' is 'insufficient':
    - Verify 'acquisition_strategy' exists and is complete
    - Flag missing strategy components
Natural Language Detection:
  "With insufficient initial resources, you must define a clear acquisition
   strategy including competitive positioning, risk factors, and mitigation measures."
Response: CLARIFY
```

### 4.3 Competition Without Gap Analysis Pattern
```
Pattern: Organization facing competition without resource gap quantification
Detection Rule:
  - If 'resource_status' is 'competition_required':
    - Verify 'resource_gap' is fully populated
    - Confirm gap amount and percentage are calculated
Natural Language Detection:
  "Facing resource competition requires quantification of the resource gap.
   Please provide current resources, required resources, and calculated gap."
Response: CLARIFY
```

### 4.4 Missing Competitive Landscape Pattern
```
Pattern: Competition situation without competitive landscape analysis
Detection Rule:
  - If 'competition_level' is not 'none':
    - Verify 'competitive_landscape' exists
    - Check peer count and market position are specified
    - Flag missing competitive factors
Natural Language Detection:
  "Please analyze the competitive landscape, including peer count, market
   position, and specific advantages and disadvantages."
Response: CLARIFY
```

### 4.5 Alternative Scenario Discrepancy Pattern
```
Pattern: Both resource scenarios indicated without clear distinction
Detection Rule:
  - Check 'alternative_scenario.has_sufficient_initial_resources'
  - If true, verify 'scenario_details' and 'comparison' are substantive
  - Flag vague alternative descriptions
Natural Language Detection:
  "If an alternative scenario with sufficient resources exists, please
   provide specific details and a clear comparison with the current situation."
Response: CLARIFY
```

## 5. Prompt Templates

### 5.1 Resource Assessment Template
```
Assessing resource situation for: {organization_name}

Resource Competition Status:
[ ] Resource competition IS required (future income needed)
[ ] Resource competition is NOT required (sufficient initial resources)

If Competition Required:
- What type of future income? (trading, investment, loan, grant, mixed)
- What is the competition level? (none, low, medium, high, intense)
- What is the resource gap?
  - Current resources: {current}
  - Required resources: {required}
  - Gap: {gap}

Competitive Landscape:
- How many peers are competing?
- What is your market position?
- What are your competitive advantages?
- What are your competitive disadvantages?
```

### 5.2 Strategy Definition Template
```
Defining acquisition strategy:

Strategy Type:
- Organic growth: Build resources through operations
- Partnership: Collaborate with other organizations
- Investment: Seek investment funding
- Loan: Secure loan financing
- Mixed: Combination of approaches

Competitive Positioning:
- How will you position against peers?
- What makes you competitive?
- How will you address disadvantages?

Risk Assessment:
- What could go wrong?
- How will you mitigate identified risks?
```

## 6. JSON Example

```json
{
  "resource_id": "cb4ab0e9-001",
  "organization_context": {
    "organization_id": "org-001",
    "organization_name": "Tech Startup Inc."
  },
  "resource_status": "competition_required",
  "resource_situation_details": {
    "initial_resource_availability": "insufficient",
    "future_income_dependence": true,
    "income_source_type": "mixed",
    "competition_level": "intense",
    "competitive_landscape": {
      "peer_count": 50,
      "market_position": "weak",
      "competitive_advantages": [
        "Innovative technology",
        "Experienced team"
      ],
      "competitive_disadvantages": [
        "Limited marketing budget",
        "Small customer base"
      ]
    },
    "resource_gap": {
      "current_resources": 500000,
      "required_resources": 2000000,
      "gap_amount": 1500000,
      "gap_percentage": 75
    }
  },
  "acquisition_strategy": {
    "strategy_type": "mixed",
    "competitive_positioning": "Differentiate through technology innovation while building strategic partnerships",
    "risk_factors": [
      "Inability to secure funding",
      "Market competition intensifying",
      "Technology advantage erosion"
    ],
    "mitigation_measures": [
      "Multiple funding source approach",
      "Rapid partnership development",
      "Continuous innovation pipeline"
    ]
  },
  "alternative_scenario": {
    "has_sufficient_initial_resources": false
  },
  "submitted_by": "founder_agent",
  "submitted_at": "2025-01-10T12:00:00Z"
}
```

## 7. Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| organization_id | Must not be empty | "Organization identifier is required" |
| organization_name | Must not be empty | "Organization name is required" |
| resource_status | Required | "Resource competition status is required" |
| initial_resource_availability | Required | "Initial resource availability must be specified" |
| future_income_dependence | Required | "Future income dependence must be specified" |
| competition_level | Required | "Competition level must be specified" |
| strategy_type | Required if insufficient resources | "Acquisition strategy is required" |
| gap_amount | Required if competition required | "Resource gap must be quantified" |

## 8. Dependencies and Relationships

### 8.1 Depends On
- **d0111eb4**: Expected Effect Justification - May require justification of resource projections
- **91ff9448**: Regulatory Compliance Infrastructure - Resource requirements for compliance

### 8.2 Related Skills
- **5ab2b2ba**: Leadership Transition Protocol - Resource management during transitions
- **dbe32f79**: Behavioral Verification Methods - Verification of resource claims

## 9. Error Handling Behaviors

| Error Type | Handling Behavior |
|------------|-------------------|
| Unidentified competition status | REFUSE, require explicit status |
| Missing strategy for insufficient resources | REFUSE, require acquisition strategy |
| Missing gap analysis | REFUSE, require quantification |
| Missing competitive landscape | REFUSE, require landscape analysis |
| Vague alternative scenario | CLARIFY, require specifics |

## 10. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-10 | Initial release |

---

**End of Skill cb4ab0e9**
