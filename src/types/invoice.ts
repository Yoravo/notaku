export type SerializedInvoice = {
  id: string;
  publicId: string;
  userId: string;
  customerId: string;
  number: string | null;
  status: string;
  dueDate: string | null;
  notes: string | null;
  total: number;
  createdAt: string;
  customer: {
    id: string;
    userId: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: string;
  };
};
