/**
 * GraphQL Queries for Contacts
 * 
 * All queries follow pg_graphql naming conventions:
 * - PascalCase collection names
 * - Relay-style pagination (edges → node)
 */

import gql from 'graphql-tag';

/**
 * GET_CONTACTS
 * Fetches all contacts for the current user (RLS enforced)
 * Used on Home screen for contact list
 */
export const GET_CONTACTS = gql`
  query GetContacts {
    contactsCollection {
      edges {
        node {
          id
          name
          phone
          email
          is_completed_profile
          designation
          company_name
          tags
          created_at
        }
      }
    }
  }
`;

/**
 * GET_CONTACT_DASHBOARD
 * Fetches full contact details with related tasks, meetings, transactions
 * Used on Contact Details screen
 */
export const GET_CONTACT_DASHBOARD = gql`
  query GetContactDashboard($id: UUID!) {
    contactsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          name
          phone
          email
          notes
          is_completed_profile
          designation
          company_name
          tags
          created_at
          
          tasksCollection {
            edges {
              node {
                id
                title
                description
                status
                priority
                due_date
                reminder_at
                completed_at
                created_at
              }
            }
          }
          
          meetingsCollection {
            edges {
              node {
                id
                title
                meeting_type
                status
                scheduled_start
                scheduled_end
                location
                notes
                outcome
                reminder_at
                created_at
              }
            }
          }
          
          transactionsCollection {
            edges {
              node {
                id
                amount
                currency
                category
                status
                transaction_date
                reference_id
                notes
                created_at
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * GET_ALL_TASKS
 * Fetches all tasks across all contacts
 */
export const GET_ALL_TASKS = gql`
  query GetAllTasks {
    tasksCollection(orderBy: { created_at: DescNullsLast }) {
      edges {
        node {
          id
          title
          description
          status
          priority
          due_date
          created_at
          contact: contacts {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_TASK_DETAILS = gql`
  query GetTaskDetails($id: UUID!) {
    tasksCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          title
          description
          status
          priority
          due_date
          created_at
          contact: contacts {
            id
            name
            company_name
            designation
          }
        }
      }
    }
  }
`;

export const GET_MEETING_DETAILS = gql`
  query GetMeetingDetails($id: UUID!) {
    meetingsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          title
          meeting_type
          status
          scheduled_start
          location
          notes
          created_at
          contact: contacts {
            id
            name
            company_name
            designation
          }
        }
      }
    }
  }
`;

export const GET_TRANSACTION_DETAILS = gql`
  query GetTransactionDetails($id: UUID!) {
    transactionsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          amount
          currency
          category
          status
          transaction_date
          notes
          created_at
          contact: contacts {
            id
            name
            company_name
            designation
          }
        }
      }
    }
  }
`;

export const GET_ALL_MEETINGS = gql`
  query GetAllMeetings {
    meetingsCollection(orderBy: { scheduled_start: DescNullsLast }) {
      edges {
        node {
          id
          title
          meeting_type
          status
          scheduled_start
          location
          created_at
          contact: contacts {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_ALL_TRANSACTIONS = gql`
  query GetAllTransactions {
    transactionsCollection(orderBy: { transaction_date: DescNullsLast }) {
      edges {
        node {
          id
          amount
          currency
          category
          status
          transaction_date
          created_at
          contact: contacts {
            id
            name
          }
        }
      }
    }
  }
`;
