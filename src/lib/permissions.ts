type Role = 'USER' | 'AGENT' | 'ADMIN';

export interface TicketActor {
  id: string;
  role: Role | string;
}

export interface EditableTicket {
  authorId: string;
  assigneeId?: string | null;
}

export function canEditTicket(user: TicketActor, ticket: EditableTicket): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'AGENT') return ticket.assigneeId === user.id;
  return ticket.authorId === user.id;
}
