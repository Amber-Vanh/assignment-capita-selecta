export function EmptyState({ icon, title, message, action, testId }) {
  return (
    <div className="empty-state" data-testid={testId}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <p className="empty-state__title">{title}</p>
      {message && <p className="empty-state__message">{message}</p>}
      {action}
    </div>
  );
}
