<script setup lang="ts">
  import {
    FlexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useVueTable,
  } from "@tanstack/vue-table";
  import UiContextMenu from "~/components/Ui/ContextMenu/ContextMenu.vue";
  import UiContextMenuTrigger from "~/components/Ui/ContextMenu/Trigger.vue";
  import UiContextMenuContent from "~/components/Ui/ContextMenu/Content.vue";
  import UiContextMenuGroup from "~/components/Ui/ContextMenu/Group.vue";
  import UiContextMenuCheckboxItem from "~/components/Ui/ContextMenu/CheckboxItem.vue";
  import UiContextMenuLabel from "~/components/Ui/ContextMenu/Label.vue";
  import UiContextMenuSeparator from "~/components/Ui/ContextMenu/Separator.vue";
  import UiAvatar from "~/components/Ui/Avatar/Avatar.vue";
  import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
  import { useOrganizationMembers } from "~/composables/useOrganizationMembers";
  import { useTasks } from "~/composables/useTasks";
  import {
    HomeTasksDataTableColumnHeader,
    HomeTasksDataTableRowAction,
    UiCheckbox,
  } from "#components";
  import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
  } from "@tanstack/vue-table";

  interface DataTableProps {
    data: HomeTask[];
  }
  const props = defineProps<DataTableProps>();

  const sorting = ref<SortingState>([]);
  const columnFilters = ref<ColumnFiltersState>([]);
  const columnVisibility = ref<VisibilityState>({});
  const rowSelection = ref({});

  const columns: ColumnDef<HomeTask>[] = [
    {
      id: "select",
      header: ({ table }) =>
        h(UiCheckbox, {
          modelValue:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate"),
          "onUpdate:modelValue": (value) => table.toggleAllPageRowsSelected(!!value),
          ariaLabel: "Select all",
          class: "translate-y-0.5",
        }),
      cell: ({ row }) =>
        h(UiCheckbox, {
          modelValue: row.getIsSelected(),
          "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
          ariaLabel: "Select row",
          class: "translate-y-0.5",
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => h(HomeTasksDataTableColumnHeader, { column, title: "Title" }),

      cell: ({ row }) => {
        return h("div", { class: "flex space-x-2" }, [
          h("span", { class: "max-w-[500px] truncate font-medium" }, row.getValue("title")),
        ]);
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => h(HomeTasksDataTableColumnHeader, { column, title: "Status" }),

      cell: ({ row }) => {
        const status = homeTasksStatuses.find((status) => status.value === row.getValue("status"));

        if (!status) return null;

        return h("div", { class: "flex w-[100px] items-center" }, [
          status.icon && h(status.icon, { class: "mr-2 h-4 w-4 text-muted-foreground" }),
          h("span", status.label),
        ]);
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => h(HomeTasksDataTableColumnHeader, { column, title: "Priority" }),
      cell: ({ row }) => {
        const priority = homeTasksPriorities.find(
          (priority) => priority.value === row.getValue("priority")
        );

        if (!priority) return null;

        return h("div", { class: "flex items-center" }, [
          priority.icon && h(priority.icon, { class: "mr-2 h-4 w-4 text-muted-foreground" }),
          h("span", {}, priority.label),
        ]);
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      cell: ({ row }) => h(HomeTasksDataTableRowAction, { row }),
    },
  ];

  const table = useVueTable({
    get data() {
      return props.data;
    },
    get columns() {
      return columns;
    },
    state: {
      get sorting() {
        return sorting.value;
      },
      get columnFilters() {
        return columnFilters.value;
      },
      get columnVisibility() {
        return columnVisibility.value;
      },
      get rowSelection() {
        return rowSelection.value;
      },
    },
    enableRowSelection: true,
    onSortingChange: (updaterOrValue) => tanstackValueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: (updaterOrValue) => tanstackValueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: (updaterOrValue) =>
      tanstackValueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: (updaterOrValue) => tanstackValueUpdater(updaterOrValue, rowSelection),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Organisation members for assignment
  const selectedOrgId = useSelectedOrganisationId();
  const { members: orgMembers } = useOrganizationMembers(selectedOrgId);
  const { updateTask, loadTasks } = useTasks();

  function memberKey(m: any) {
    return m?.id ?? m?.email ?? m?.name ?? "";
  }
  function isMemberAssigned(row: any, member: any) {
    const owners: any[] = Array.isArray((row.original as any)?.owners) ? (row.original as any).owners : [];
    const key = String(memberKey(member));
    return owners.some((o: any) => String(o) === key);
  }
  async function toggleMemberAssignment(row: any, member: any) {
    const taskId = String((row.original as any)?.id || "");
    if (!taskId) return;
    const currentOwners: string[] = Array.isArray((row.original as any)?.owners) ? [...(row.original as any).owners] : [];
    const key = String(memberKey(member));
    const idx = currentOwners.findIndex((o) => String(o) === key);
    if (idx >= 0) currentOwners.splice(idx, 1);
    else currentOwners.push(key);
    await updateTask(taskId, { owners: currentOwners } as any);
    await loadTasks();
  }
</script>

<template>
  <div class="space-y-4">
    <HomeTasksDataTableToolbar :table />
    <div class="rounded-md border">
      <UiTable>
        <UiTableHeader>
          <UiTableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <UiTableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <template v-if="table.getRowModel().rows?.length">
            <UiContextMenu v-for="row in table.getRowModel().rows" :key="row.id">
              <UiContextMenuTrigger as-child>
                <UiTableRow :data-state="row.getIsSelected() && 'selected'">
                  <UiTableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                  </UiTableCell>
                </UiTableRow>
              </UiContextMenuTrigger>
              <UiContextMenuContent class="w-64">
                <UiContextMenuLabel class="my-1" label="Assign to member(s)" />
                <UiContextMenuSeparator />
                <UiContextMenuGroup>
                  <UiContextMenuCheckboxItem
                    v-for="member in orgMembers"
                    :key="member.id || member.email"
                    inset
                    class="mb-1"
                    :model-value="isMemberAssigned(row, member)"
                    @select="(e) => e.preventDefault()"
                    @click="toggleMemberAssignment(row, member)"
                  >
                    <div class="flex items-center gap-3">
                      <UiAvatar class="h-6 w-6" :alt="member.name || member.email">
                        <template #fallback>
                          <span class="text-[10px]">
                            {{ (member.name || member.email || '').charAt(0).toUpperCase() }}
                          </span>
                        </template>
                      </UiAvatar>
                      <span class="truncate">{{ member.name || member.email }}</span>
                    </div>
                  </UiContextMenuCheckboxItem>
                </UiContextMenuGroup>
              </UiContextMenuContent>
            </UiContextMenu>
          </template>

          <UiTableRow v-else>
            <UiTableCell :colspan="columns.length" class="h-24 text-center">
              No results.
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    <ClientOnly>
      <HomeTasksDataTablePagination :table />
    </ClientOnly>
  </div>
</template>
