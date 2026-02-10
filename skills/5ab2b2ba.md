# Skill: 5ab2b2ba - Leadership Transition Protocol

**Version**: 1.0.0
**Skill ID**: 5ab2b2ba
**Category**: Governance
**Last Updated**: 2025-01-10

---

## 1. Description

This skill defines the protocol for transitioning actual control of an organization while maintaining business stability and continuity. The protocol emphasizes that leadership transitions must be based on demonstrated capability and contribution, not mere appointment. Agents must ensure transitions don't disrupt operations and that new leaders can genuinely exercise control based on capability.

## 2. Input Data Structure

```yaml
$schema: https://agentskills.io/schemas/leadership_transition
type: object
properties:
  transition_id:
    type: string
    pattern: ^[a-f0-9]{8}$
    description: Unique identifier for this transition record
  transition_context:
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
      transition_type:
        type: string
        enum: [planned_succession, emergency_replacement, election, acquisition, voluntary_stepping_down]
        description: Type of leadership transition
        required: true
      transition_reason:
        type: string
        description: Reason for transition
      current_leader:
        type: object
        properties:
          leader_id:
            type: string
            description: Current leader identifier
            required: true
          leader_name:
            type: string
            description: Current leader name
            required: true
          tenure_start:
            type: string
            format: date
            description: Tenure start date
          tenure_end:
            type: string
            format: date
            description: Planned tenure end date
          departure_reason:
            type: string
            description: Reason for departure
        required:
          - leader_id
          - leader_name
    required:
      - organization_id
      - organization_name
      - transition_type
  successor_assessment:
    type: object
    properties:
      successor_id:
        type: string
        description: Identified successor identifier
        required: true
      successor_name:
        type: string
        description: Successor name
        required: true
      capability_assessment:
        type: object
        properties:
          technical_capability:
            type: number
            minimum: 1
            maximum: 10
            description: Technical skills rating
          leadership_capability:
            type: number
            minimum: 1
            maximum: 10
            description: Leadership skills rating
          strategic_capability:
            type: number
            minimum: 1
            maximum: 10
            description: Strategic thinking rating
          overall_score:
            type: number
            minimum: 1
            maximum: 10
            description: Overall capability score
            required: true
          assessment_basis:
            type: string
            enum: [performance_history, evaluation_process, external_assessment, mixed]
            description: Basis for assessment
            required: true
        required:
          - overall_score
          - assessment_basis
      contribution_history:
        type: array
        items:
          type: object
          properties:
            contribution_id:
              type: string
              description: Contribution identifier
            contribution_type:
              type: string
              enum: [project_delivery, revenue_generation, team_development, innovation, operational_improvement]
              description: Type of contribution
            contribution_description:
              type: string
              description: Description of contribution
            contribution_impact:
              type: string
              enum: [high, medium, low]
              description: Impact level
            contribution_date:
              type: string
              format: date
              description: Date of contribution
        required:
          - successor_id
          - successor_name
  transition_plan:
    type: object
    properties:
      transition_timeline:
        type: object
        properties:
          announcement_date:
            type: string
            format: date
            description: Date to announce transition
          transition_start_date:
            type: string
            format: date
            description: When new leader takes over
          transition_end_date:
            type: string
            format: date
            description: When transition completes
          overlap_period:
            type: number
            description: Number of days of leader overlap
      business_continuity_measures:
        type: array
        items:
          type: string
        description: Measures to ensure business continuity
      stakeholder_communication:
        type: object
        properties:
          communication_plan:
            type: string
            description: Plan for communicating transition
          internal_stakeholders:
            type: array
            items:
              type: string
            description: Internal groups to notify
          external_stakeholders:
            type: array
            items:
              type: string
            description: External groups to notify
      authority_transfer:
        type: object
        properties:
          access_transfer:
            type: array
            items:
              type: string
            description: Access rights to transfer
          decision_authority:
            type: string
            description: Decision authority transfer plan
          financial_authority:
            type: string
            description: Financial authority transfer plan
      capability_confirmation:
        type: object
        properties:
          has_demonstrated_capability:
            type: boolean
            description: Whether capability has been demonstrated
            required: true
          demonstration_evidence:
            type: string
            description: Evidence of demonstrated capability
          has_controlled_operations:
            type: boolean
            description: Whether successor has controlled operations
          controlled_scope:
            type: string
            description: Scope of controlled operations
        required:
          - has_demonstrated_capability
  transition_status:
    type: string
    enum: [planned, in_progress, completed, cancelled, on_hold]
    description: Current transition status
    required: true
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
$schema: https://agentskills.io/schemas/leadership_transition_validation_result
type: object
properties:
  decision:
    type: string
    enum: [COMPLIANT, IGNORE, CLARIFY]
    description: Compliance decision
  transition_id:
    type: string
    pattern: ^[a-f0-9]{8}$
    description: Reference to transition record
  capability_based_selection:
    type: boolean
    description: Whether successor selected based on capability
  contribution_demonstrated:
    type: boolean
    description: Whether contributions are documented
  continuity_measures_adequate:
    type: boolean
    description: Whether continuity measures are sufficient
  timeline_reasonable:
    type: boolean
    description: Whether transition timeline is appropriate
  authority_transfer_planned:
    type: boolean
    description: Whether authority transfer is properly planned
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

### 4.1 Capability Not Assessed Pattern
```
Pattern: Leadership transition without successor capability assessment
Detection Rule:
  - Check 'successor_assessment.capability_assessment' exists
  - Verify 'overall_score' and 'assessment_basis' are provided
  - Flag transitions without capability documentation
Natural Language Detection:
  "Leadership transitions must be based on demonstrated capability.
   Please provide a capability assessment with overall score and basis."
Response: CLARIFY
```

### 4.2 Contribution History Missing Pattern
```
Pattern: Successor without documented contribution history
Detection Rule:
  - Check 'successor_assessment.contribution_history' is not empty
  - Verify contributions have descriptions and impact levels
  - Flag successors without track record
Natural Language Detection:
  "The successor must have a documented history of contributions.
   Please provide evidence of past contributions with their impact."
Response: CLARIFY
```

### 4.3 Capability Not Demonstrated Pattern
```
Pattern: Successor claimed to have capability without demonstration
Detection Rule:
  - Check 'capability_confirmation.has_demonstrated_capability' is true
  - Verify 'demonstration_evidence' is substantive
  - Flag unsubstantiated capability claims
Natural Language Detection:
  "Capability claims must be supported by demonstrated evidence.
   Please provide specific examples of how capability has been shown."
Response: CLARIFY
```

### 4.4 Continuity Measures Missing Pattern
```
Pattern: Leadership transition without business continuity plan
Detection Rule:
  - Check 'transition_plan.business_continuity_measures' exists
  - Verify measures address operations, stakeholders, authority
  - Flag transitions that could disrupt business
Natural Language Detection:
  "Leadership transitions must include measures to ensure business
   continuity. Please describe how operations will remain stable."
Response: CLARIFY
```

### 4.5 No Controlled Operations Pattern
```
Pattern: Successor without evidence of having controlled operations
Detection Rule:
  - Check 'capability_confirmation.has_controlled_operations' is true
  - Verify 'controlled_scope' is described
  - Flag successors without operational control experience
Natural Language Detection:
  "The successor should have experience controlling operations.
   Please provide evidence of operational control scope."
Response: CLARIFY
```

## 5. Prompt Templates

### 5.1 Transition Initiation Template
```
Initiating leadership transition for: {organization_name}

Transition Type:
- Planned succession: Normal rotation or retirement
- Emergency replacement: Sudden departure requiring quick action
- Election: Democratic selection process
- Acquisition: Leadership change due to acquisition
- Voluntary stepping down: Leader's own decision

Successor Requirements:
1. Capability Assessment
   - Overall score (1-10): {score}
   - Assessment basis: {basis}
   
2. Contribution History
   - Document significant contributions
   - Specify impact level for each
   
3. Operational Control
   - Has controlled operations? {yes/no}
   - Scope of control: {description}
```

### 5.2 Continuity Planning Template
```
Ensuring business continuity during transition:

Timeline:
- Announcement date: {date}
- Transition start: {date}
- Transition end: {date}
- Overlap period: {days} days

Continuity Measures:
1. Operational Continuity:
   - How will daily operations continue?
   - What key functions need coverage?

2. Stakeholder Communication:
   - Who needs to be notified internally?
   - Who needs to be notified externally?
   - What is the communication plan?

3. Authority Transfer:
   - What access rights transfer?
   - What decision authority transfers?
   - What financial authority transfers?
```

## 6. JSON Example

```json
{
  "transition_id": "5ab2b2ba-001",
  "transition_context": {
    "organization_id": "org-001",
    "organization_name": "Innovation Labs Inc.",
    "transition_type": "planned_succession",
    "transition_reason": "Planned retirement after 10 years of service",
    "current_leader": {
      "leader_id": "leader-001",
      "leader_name": "Jane Smith",
      "tenure_start": "2015-01-01",
      "tenure_end": "2025-03-31"
    }
  },
  "successor_assessment": {
    "successor_id": "successor-001",
    "successor_name": "Alex Johnson",
    "capability_assessment": {
      "technical_capability": 9,
      "leadership_capability": 8,
      "strategic_capability": 9,
      "overall_score": 8.7,
      "assessment_basis": "mixed"
    },
    "contribution_history": [
      {
        "contribution_id": "cont-001",
        "contribution_type": "project_delivery",
        "contribution_description": "Led flagship product development resulting in 40% revenue increase",
        "contribution_impact": "high",
        "contribution_date": "2023-06-15"
      },
      {
        "contribution_id": "cont-002",
        "contribution_type": "team_development",
        "contribution_description": "Built and mentored 15-person engineering team",
        "contribution_impact": "high",
        "contribution_date": "2024-01-20"
      }
    ]
  },
  "transition_plan": {
    "transition_timeline": {
      "announcement_date": "2025-01-15",
      "transition_start_date": "2025-02-01",
      "transition_end_date": "2025-03-31",
      "overlap_period": 59
    },
    "business_continuity_measures": [
      "Gradual responsibility transfer over 60 days",
      "Weekly strategic alignment meetings",
      "Cross-functional team briefings",
      "Client relationship hand-off protocol"
    ],
    "stakeholder_communication": {
      "communication_plan": "Phased communication starting with board, then leadership team, then all staff",
      "internal_stakeholders": ["board", "executive_team", "all_staff"],
      "external_stakeholders": ["key_clients", "investors", "partners"]
    },
    "authority_transfer": {
      "access_transfer": ["email", "project_management_systems", "financial_systems", "strategic_documents"],
      "decision_authority": "Gradual transfer starting with operational decisions, ending with strategic decisions",
      "financial_authority": "Progressive authority increase aligned with transition timeline"
    },
    "capability_confirmation": {
      "has_demonstrated_capability": true,
      "demonstration_evidence": "Three years of progressive leadership roles with measurable outcomes",
      "has_controlled_operations": true,
      "controlled_scope": "Full P&L responsibility for $10M business unit for 2 years"
    }
  },
  "transition_status": "planned",
  "submitted_by": "board_secretary",
  "submitted_at": "2025-01-10T13:00:00Z"
}
```

## 7. Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| organization_id | Must not be empty | "Organization identifier is required" |
| organization_name | Must not be empty | "Organization name is required" |
| transition_type | Required | "Transition type is required" |
| current_leader | Required | "Current leader information is required" |
| successor_id | Must not be empty | "Successor identifier is required" |
| successor_name | Must not be empty | "Successor name is required" |
| overall_score | Required, 1-10 range | "Overall capability score is required" |
| assessment_basis | Required | "Assessment basis is required" |
| contribution_history | Required, minimum 1 | "At least one contribution must be documented" |
| business_continuity_measures | Required, minimum 1 | "At least one continuity measure is required" |
| has_demonstrated_capability | Required | "Capability demonstration status is required" |

## 8. Dependencies and Relationships

### 8.1 Depends On
- **6d206b54**: Hierarchical Authority Relations - Authority transfer validation
- **d0111eb4**: Expected Effect Justification - Justification of leadership decisions

### 8.2 Related Skills
- **91ff9448**: Regulatory Compliance Infrastructure - Compliance during transition
- **12119600**: Branch Version Management - Branch adoption during leadership changes

## 9. Error Handling Behaviors

| Error Type | Handling Behavior |
|------------|-------------------|
| Missing capability assessment | REFUSE transmission, require assessment |
| Missing contribution history | REFUSE transmission, require contribution documentation |
| Unsubstantiated capability | REFUSE transmission, require evidence |
| Missing continuity measures | REFUSE transmission, require continuity plan |
| No operational control experience | CLARIFY, may require additional oversight |

## 10. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-10 | Initial release |

---

**End of Skill 5ab2b2ba**
