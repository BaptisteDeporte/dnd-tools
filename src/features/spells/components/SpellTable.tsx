import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"
import type { Spell } from "../data/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLanguage } from "@/i18n/LanguageContext"

interface SpellTableProps {
  table: TanstackTable<Spell>
  onSelectSpell: (spell: Spell) => void
}

const SortIndicator = ({ direction }: { direction: false | "asc" | "desc" }) =>
  direction === false ? null : (
    <span className="ml-1 text-muted-foreground">
      {direction === "asc" ? "↑" : "↓"}
    </span>
  )

export const SpellTable = ({ table, onSelectSpell }: SpellTableProps) => {
  const { t } = useLanguage()

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <p className="text-lg font-medium">{t("empty.title")}</p>
        <p className="text-sm">{t("empty.description")}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-background">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={
                  header.column.getCanSort()
                    ? "cursor-pointer select-none"
                    : ""
                }
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                {header.column.getCanSort() && (
                  <SortIndicator
                    direction={header.column.getIsSorted()}
                  />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="cursor-pointer even:bg-muted/50 hover:!bg-muted"
            onClick={() => onSelectSpell(row.original)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
