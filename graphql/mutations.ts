/**
 * GraphQL Mutations
 * 
 * All mutations follow pg_graphql naming conventions:
 * - insertInto<Collection> for creates
 * - update<Collection> for updates
 * - deleteFrom<Collection> for deletes
 * 
 * CRITICAL: Never pass user_id from client - RLS handles this automatically
 */

import gql from 'graphql-tag';

// ============================================
// CONTACT MUTATIONS
// ============================================

/**
 * CREATE_CONTACT
 * Creates a new contact for the current user
 * user_id is automatically set by RLS trigger
 */
export const CREATE_CONTACT = gql`
  mutation CreateContact(
    $name: String!
    $phone: String
    $email: String
    $designation: String
    $companyName: String
    $tags: JSON
  ) {
    insertIntocontactsCollection(
      objects: [{
        name: $name
        phone: $phone
        email: $email
        designation: $designation
        company_name: $companyName
        tags: $tags
      }]
    ) {
      records {
        id
        name
        phone
        email
        designation
        company_name
        tags
        is_completed_profile
        created_at
      }
    }
  }
`;

/**
 * UPDATE_CONTACT
 * Updates contact basic info
 */
export const UPDATE_CONTACT = gql`
  mutation UpdateContact(
    $id: UUID!
    $name: String
    $phone: String
    $email: String
    $designation: String
    $companyName: String
    $tags: JSON
    $notes: String
    $isCompletedProfile: Boolean
  ) {
    updatecontactsCollection(
      filter: { id: { eq: $id } }
      set: {
        name: $name
        phone: $phone
        email: $email
        designation: $designation
        company_name: $companyName
        tags: $tags
        notes: $notes
        is_completed_profile: $isCompletedProfile
      }
    ) {
      affectedCount
      records {
        id
        name
        phone
        email
        designation
        company_name
        tags
        notes
        is_completed_profile
      }
    }
  }
`;

/**
 * COMPLETE_CONTACT_PROFILE
 * Marks a contact profile as complete with additional notes
 */
export const COMPLETE_CONTACT_PROFILE = gql`
  mutation CompleteContactProfile($id: UUID!, $notes: String) {
    updatecontactsCollection(
      filter: { id: { eq: $id } }
      set: { notes: $notes, is_completed_profile: true }
    ) {
      affectedCount
      records {
        id
        is_completed_profile
        notes
      }
    }
  }
`;

/**
 * DELETE_CONTACT
 * Deletes a contact and all related data (CASCADE)
 */
export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: UUID!) {
    deleteFromcontactsCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`;

// ============================================
// TASK MUTATIONS
// ============================================

/**
 * CREATE_TASK
 * Creates a task linked to a specific contact
 */
export const CREATE_TASK = gql`
  mutation CreateTask(
    $contactId: UUID!
    $title: String!
    $description: String
    $priority: String
    $status: String
    $dueDate: Datetime
    $reminderAt: Datetime
  ) {
    insertIntotasksCollection(
      objects: [{
        contact_id: $contactId
        title: $title
        description: $description
        priority: $priority
        status: $status
        due_date: $dueDate
        reminder_at: $reminderAt
      }]
    ) {
      records {
        id
        title
        description
        status
        priority
        due_date
        created_at
      }
    }
  }
`;

/**
 * UPDATE_TASK
 * Updates task details
 */
export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: UUID!
    $title: String
    $description: String
    $priority: String
    $status: String
    $dueDate: Datetime
  ) {
    updatetasksCollection(
      filter: { id: { eq: $id } }
      set: {
        title: $title
        description: $description
        priority: $priority
        status: $status
        due_date: $dueDate
      }
    ) {
      affectedCount
      records {
        id
        title
        status
      }
    }
  }
`;

/**
 * COMPLETE_TASK
 * Marks a task as completed
 */
export const COMPLETE_TASK = gql`
  mutation CompleteTask($id: UUID!) {
    updatetasksCollection(
      filter: { id: { eq: $id } }
      set: { status: "completed", completed_at: "now()" }
    ) {
      affectedCount
    }
  }
`;

/**
 * DELETE_TASK
 */
export const DELETE_TASK = gql`
  mutation DeleteTask($id: UUID!) {
    deleteFromtasksCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`;

// ============================================
// MEETING MUTATIONS
// ============================================

/**
 * CREATE_MEETING
 * Creates a meeting linked to a specific contact
 */
export const CREATE_MEETING = gql`
  mutation CreateMeeting(
    $contactId: UUID!
    $title: String!
    $meetingType: String!
    $scheduledStart: String!
    $scheduledEnd: String
    $location: String
    $notes: String
  ) {
    insertIntomeetingsCollection(
      objects: [{
        contact_id: $contactId
        title: $title
        meeting_type: $meetingType
        scheduled_start: $scheduledStart
        scheduled_end: $scheduledEnd
        location: $location
        notes: $notes
        status: "scheduled"
      }]
    ) {
      records {
        id
        title
        meeting_type
        scheduled_start
        status
        created_at
      }
    }
  }
`;

/**
 * UPDATE_MEETING
 */
export const UPDATE_MEETING = gql`
  mutation UpdateMeeting(
    $id: UUID!
    $title: String
    $meetingType: String
    $scheduledStart: Datetime
    $scheduledEnd: Datetime
    $location: String
    $status: String
    $outcome: String
    $notes: String
  ) {
    updatemeetingsCollection(
      filter: { id: { eq: $id } }
      set: {
        title: $title
        meeting_type: $meetingType
        scheduled_start: $scheduledStart
        scheduled_end: $scheduledEnd
        location: $location
        status: $status
        outcome: $outcome
        notes: $notes
      }
    ) {
      affectedCount
      records {
        id
        title
        status
        outcome
        meeting_type
        location
      }
    }
  }
`;

/**
 * DELETE_MEETING
 */
export const DELETE_MEETING = gql`
  mutation DeleteMeeting($id: UUID!) {
    deleteFrommeetingsCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`;

// ============================================
// TRANSACTION MUTATIONS
// ============================================

/**
 * CREATE_TRANSACTION
 * Creates a transaction linked to a specific contact
 */
export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction(
    $contactId: UUID!
    $amount: BigFloat!
    $currency: String!
    $category: String
    $status: String
    $transactionDate: Datetime
    $referenceId: String
    $notes: String
  ) {
    insertIntotransactionsCollection(
      objects: [{
        contact_id: $contactId
        amount: $amount
        currency: $currency
        category: $category
        status: $status
        transaction_date: $transactionDate
        reference_id: $referenceId
        notes: $notes
      }]
    ) {
      records {
        id
        amount
        currency
        category
        status
        transaction_date
        created_at
      }
    }
  }
`;

/**
 * UPDATE_TRANSACTION
 */
export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction(
    $id: UUID!
    $amount: BigFloat
    $currency: String
    $category: String
    $status: String
    $transactionDate: Datetime
    $notes: String
  ) {
    updatetransactionsCollection(
      filter: { id: { eq: $id } }
      set: {
        amount: $amount
        currency: $currency
        category: $category
        status: $status
        transaction_date: $transactionDate
        notes: $notes
      }
    ) {
      affectedCount
      records {
        id
        amount
        status
        currency
        category
      }
    }
  }
`;

/**
 * DELETE_TRANSACTION
 */
export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: UUID!) {
    deleteFromtransactionsCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`;
