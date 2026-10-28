import { Customer } from '../models/customer.model';

export const MOCK_CUSTOMERS: readonly Customer[] = [
  { id: 'CUS-1001', fullName: 'Arun Kumar', email: 'arun.kumar@example.com', phone: '9876543210', city: 'Chennai', status: 'Active', riskLevel: 'Low', reviewRequired: false, createdAt: '2026-01-12T09:30:00Z', updatedAt: '2026-10-01T11:15:00Z' },
  { id: 'CUS-1002', fullName: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '9876543211', city: 'Coimbatore', status: 'Active', riskLevel: 'Medium', reviewRequired: true, createdAt: '2026-02-03T10:00:00Z', updatedAt: '2026-10-05T14:20:00Z' },
  { id: 'CUS-1003', fullName: 'Karthik Raj', email: 'karthik.raj@example.com', phone: '9876543212', city: 'Salem', status: 'Inactive', riskLevel: 'High', reviewRequired: true, createdAt: '2026-03-15T08:45:00Z', updatedAt: '2026-09-22T16:10:00Z' },
  { id: 'CUS-1004', fullName: 'Divya Suresh', email: 'divya.suresh@example.com', phone: '9876543213', city: 'Chennai', status: 'Active', riskLevel: 'Low', reviewRequired: false, createdAt: '2026-04-08T12:00:00Z', updatedAt: '2026-10-10T09:00:00Z' },
  { id: 'CUS-1005', fullName: 'Vijay Anand', email: 'vijay.anand@example.com', phone: '9876543214', city: 'Madurai', status: 'Inactive', riskLevel: 'Medium', reviewRequired: false, createdAt: '2026-05-11T07:20:00Z', updatedAt: '2026-08-30T13:40:00Z' },
  { id: 'CUS-1006', fullName: 'Meena Lakshmi', email: 'meena.lakshmi@example.com', phone: '9876543215', city: 'Coimbatore', status: 'Active', riskLevel: 'High', reviewRequired: true, createdAt: '2026-06-02T11:30:00Z', updatedAt: '2026-10-12T15:25:00Z' },
  { id: 'CUS-1007', fullName: 'Sathish Babu', email: 'sathish.babu@example.com', phone: '9876543216', city: 'Salem', status: 'Active', riskLevel: 'Low', reviewRequired: false, createdAt: '2026-06-19T06:50:00Z', updatedAt: '2026-10-08T10:05:00Z' },
  { id: 'CUS-1008', fullName: 'Nandhini Raj', email: 'nandhini.raj@example.com', phone: '9876543217', city: 'Madurai', status: 'Inactive', riskLevel: 'High', reviewRequired: true, createdAt: '2026-07-07T14:15:00Z', updatedAt: '2026-09-15T12:30:00Z' },
  { id: 'CUS-1009', fullName: 'Praveen Kumar', email: 'praveen.kumar@example.com', phone: '9876543218', city: 'Chennai', status: 'Active', riskLevel: 'Medium', reviewRequired: false, createdAt: '2026-08-21T09:10:00Z', updatedAt: '2026-10-14T08:35:00Z' },
  { id: 'CUS-1010', fullName: 'Anitha Devi', email: 'anitha.devi@example.com', phone: '9876543219', city: 'Coimbatore', status: 'Inactive', riskLevel: 'Low', reviewRequired: false, createdAt: '2026-09-02T13:25:00Z', updatedAt: '2026-10-16T17:00:00Z' },
];
