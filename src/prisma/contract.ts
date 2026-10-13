import { autoincrement, defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {

    const Link = model('Link', {
        fields: {
            id: field.int().id().default(autoincrement()),
            url: field.text(),
            slug: field.text().unique().optional(),
            createdAt: field.temporal.createdAtString(),
            updatedAt: field.temporal.updatedAtString(),
        },
    });

    return {
        models: {
            Link,
        },
    };
});
