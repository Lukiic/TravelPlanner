import Badge from "../../ui/components/Badge";
import type { ExpenseCategory } from "../types/ExpenseCategory";

const categoryConfig: Record<ExpenseCategory, { color: 'blue' | 'teal' | 'yellow' | 'green' | 'red' | 'slate' | 'orange'; label: string }> = {
    Transport: { color: 'blue', label: 'Transport' },
    Accommodation: { color: 'teal', label: 'Accommodation' },
    Food: { color: 'yellow', label: 'Food' },
    Tickets: { color: 'green', label: 'Tickets' },
    Shopping: { color: 'red', label: 'Shopping' },
    Other: { color: 'slate', label: 'Other' },
    Activities: { color: 'orange', label: 'Activities' },
};

export default function CategoryBadge({ category }: { category: ExpenseCategory }) {
    const { color, label } = categoryConfig[category] ?? { color: 'slate', label: category };
    return <Badge label={label} color={color} />;
}