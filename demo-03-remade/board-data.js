export const initialBoard = {
    columnOrder: ['todo', 'doing', 'done'],
    columns: {
        todo: { id: 'todo', title: 'To do', cardIds: [1, 2, 3] },
        doing: { id: 'doing', title: 'Doing', cardIds: [4] },
        done: { id: 'done', title: 'Done', cardIds: [] },
    },
    cards: {
        1: { id: 1, title: 'Research Lit', description: 'Read the Lit docs about reactive properties.', priority: 'low' },
        2: { id: 2, title: 'Build demo', description: 'Make a Kanban board with Web Components.', priority: 'medium' },
        3: { id: 3, title: 'Rehearse talk', description: 'Practise the presentation twice.', priority: 'high' },
        4: { id: 4, title: 'Write README', description: 'Explain every step of the exercise.', priority: 'medium' },
    },
};