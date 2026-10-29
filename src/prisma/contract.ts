import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, type }) => {
    return {
        models: {
            Link: model('Link', {
                fields: {
                    id: field.column(type.Int()).id(),
                    url: field.column(type.String()),
                    slug: field.column(type.String()).optional(),
                },
            }),
        },
    };
});
