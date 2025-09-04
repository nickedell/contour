export function getCommentsMap(data){
  // data.comments is expected as { [momentId]: [{ id, author, text, ts }] }
  return data?.comments || {};
}
export function addComment(data, momentId, comment){
  const next = { ...(data || {}) };
  const map = { ...(next.comments || {}) };
  const arr = (map[momentId] || []).slice();
  arr.push(comment);
  map[momentId] = arr;
  next.comments = map;
  return next;
}
export function deleteComment(data, momentId, commentId){
  const next = { ...(data || {}) };
  const map = { ...(next.comments || {}) };
  const arr = (map[momentId] || []).filter(c => c.id !== commentId);
  map[momentId] = arr;
  next.comments = map;
  return next;
}
