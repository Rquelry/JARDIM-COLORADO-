# Graph Report - .  (2026-06-01)

## Corpus Check
- Corpus is ~31,134 words - fits in a single context window. You may not need a graph.

## Summary
- 540 nodes · 529 edges · 67 communities (45 shown, 22 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Pages and Layout|Pages and Layout]]
- [[_COMMUNITY_Dev Tooling|Dev Tooling]]
- [[_COMMUNITY_Sidebar UI|Sidebar UI]]
- [[_COMMUNITY_JS Config|JS Config]]
- [[_COMMUNITY_API and Auth|API and Auth]]
- [[_COMMUNITY_Database Setup|Database Setup]]
- [[_COMMUNITY_Component Config|Component Config]]
- [[_COMMUNITY_Menu Bar UI|Menu Bar UI]]
- [[_COMMUNITY_Utility UI|Utility UI]]
- [[_COMMUNITY_Local DB Stores|Local DB Stores]]
- [[_COMMUNITY_Dashboard Widgets|Dashboard Widgets]]
- [[_COMMUNITY_Command UI|Command UI]]
- [[_COMMUNITY_Context Menu UI|Context Menu UI]]
- [[_COMMUNITY_Dropdown Menu UI|Dropdown Menu UI]]
- [[_COMMUNITY_Form UI|Form UI]]
- [[_COMMUNITY_Chart UI|Chart UI]]
- [[_COMMUNITY_Alert Dialog UI|Alert Dialog UI]]
- [[_COMMUNITY_Table UI|Table UI]]
- [[_COMMUNITY_Toast UI|Toast UI]]
- [[_COMMUNITY_Carousel UI|Carousel UI]]
- [[_COMMUNITY_Navigation Menu UI|Navigation Menu UI]]
- [[_COMMUNITY_Breadcrumb UI|Breadcrumb UI]]
- [[_COMMUNITY_Drawer UI|Drawer UI]]
- [[_COMMUNITY_Sheet UI|Sheet UI]]
- [[_COMMUNITY_Select UI|Select UI]]
- [[_COMMUNITY_Loan Workflow|Loan Workflow]]
- [[_COMMUNITY_Card UI|Card UI]]
- [[_COMMUNITY_Dialog UI|Dialog UI]]
- [[_COMMUNITY_Inventory List|Inventory List]]
- [[_COMMUNITY_Alert UI|Alert UI]]
- [[_COMMUNITY_OTP Input UI|OTP Input UI]]
- [[_COMMUNITY_Button Calendar UI|Button Calendar UI]]
- [[_COMMUNITY_Accordion UI|Accordion UI]]
- [[_COMMUNITY_Avatar UI|Avatar UI]]
- [[_COMMUNITY_Tabs UI|Tabs UI]]
- [[_COMMUNITY_Toggle Group UI|Toggle Group UI]]
- [[_COMMUNITY_Codex Hooks|Codex Hooks]]
- [[_COMMUNITY_Inventory Dialog|Inventory Dialog]]
- [[_COMMUNITY_Inventory Stats|Inventory Stats]]
- [[_COMMUNITY_Password Dialog|Password Dialog]]
- [[_COMMUNITY_Label UI|Label UI]]
- [[_COMMUNITY_Badge UI|Badge UI]]
- [[_COMMUNITY_Radio Group UI|Radio Group UI]]
- [[_COMMUNITY_Scroll Area UI|Scroll Area UI]]
- [[_COMMUNITY_Toggle UI|Toggle UI]]
- [[_COMMUNITY_Query Client|Query Client]]
- [[_COMMUNITY_Checkbox UI|Checkbox UI]]
- [[_COMMUNITY_Hover Card UI|Hover Card UI]]
- [[_COMMUNITY_Input UI|Input UI]]
- [[_COMMUNITY_Popover UI|Popover UI]]
- [[_COMMUNITY_Progress UI|Progress UI]]
- [[_COMMUNITY_Separator UI|Separator UI]]
- [[_COMMUNITY_Slider UI|Slider UI]]
- [[_COMMUNITY_Switch UI|Switch UI]]
- [[_COMMUNITY_Textarea UI|Textarea UI]]
- [[_COMMUNITY_Tooltip UI|Tooltip UI]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 25 edges
2. `compilerOptions` - 21 edges
3. `scripts` - 7 edges
4. `initDatabase()` - 7 edges
5. `tailwind` - 6 edges
6. `aliases` - 6 edges
7. `colorado` - 3 edges
8. `Badge()` - 3 edges
9. `buttonVariants` - 3 edges
10. `Calendar()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `AlertDialogHeader()` --calls--> `cn()`  [INFERRED]
  src/components/ui/alert-dialog.jsx → src/lib/utils.js
- `AlertDialogFooter()` --calls--> `cn()`  [INFERRED]
  src/components/ui/alert-dialog.jsx → src/lib/utils.js
- `BreadcrumbSeparator()` --calls--> `cn()`  [INFERRED]
  src/components/ui/breadcrumb.jsx → src/lib/utils.js
- `BreadcrumbEllipsis()` --calls--> `cn()`  [INFERRED]
  src/components/ui/breadcrumb.jsx → src/lib/utils.js
- `CommandShortcut()` --calls--> `cn()`  [INFERRED]
  src/components/ui/command.jsx → src/lib/utils.js

## Import Cycles
- None detected.

## Communities (67 total, 22 thin omitted)

### Community 0 - "Runtime Dependencies"
Cohesion: 0.03
Nodes (66): dependencies, axios, canvas-confetti, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react (+58 more)

### Community 1 - "Pages and Layout"
Cohesion: 0.06
Nodes (19): navItems, equipmentColors, equipmentIcons, categories, statusConfig, emptyForm, App(), queryClient (+11 more)

### Community 2 - "Dev Tooling"
Cohesion: 0.07
Nodes (29): devDependencies, autoprefixer, baseline-browser-mapping, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+21 more)

### Community 3 - "Sidebar UI"
Cohesion: 0.07
Nodes (25): Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel (+17 more)

### Community 4 - "JS Config"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, checkJs, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames (+16 more)

### Community 5 - "API and Auth"
Cohesion: 0.14
Nodes (11): authenticatedClient, colorado, createAxiosClient(), publicClient, ProtectedRoute(), appParams, getAppParams(), getAppParamValue() (+3 more)

### Community 6 - "Database Setup"
Cohesion: 0.15
Nodes (18): createTables(), exampleInventory, exampleLoans, exampleServiceCalls, exampleStudents, exampleTasks, exampleTeachers, setupDatabase() (+10 more)

### Community 7 - "Component Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "Menu Bar UI"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 9 - "Utility UI"
Cohesion: 0.18
Nodes (11): cn(), Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationNext(), PaginationPrevious() (+3 more)

### Community 10 - "Local DB Stores"
Cohesion: 0.20
Nodes (6): InventoryDB, LoansDB, PasswordsDB, ServiceCallsDB, TasksDB, TeachersDB

### Community 12 - "Command UI"
Cohesion: 0.20
Nodes (8): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut()

### Community 13 - "Context Menu UI"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 14 - "Dropdown Menu UI"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 15 - "Form UI"
Cohesion: 0.20
Nodes (7): FormControl, FormDescription, FormFieldContext, FormItem, FormItemContext, FormLabel, FormMessage

### Community 16 - "Chart UI"
Cohesion: 0.22
Nodes (5): ChartContainer, ChartContext, ChartLegendContent, ChartTooltipContent, THEMES

### Community 17 - "Alert Dialog UI"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 18 - "Table UI"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 19 - "Toast UI"
Cohesion: 0.22
Nodes (8): Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, toastVariants, ToastViewport

### Community 20 - "Carousel UI"
Cohesion: 0.25
Nodes (6): Carousel, CarouselContent, CarouselContext, CarouselItem, CarouselNext, CarouselPrevious

### Community 21 - "Navigation Menu UI"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 22 - "Breadcrumb UI"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 23 - "Drawer UI"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 24 - "Sheet UI"
Cohesion: 0.25
Nodes (7): SheetContent, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 25 - "Select UI"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 27 - "Card UI"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 28 - "Dialog UI"
Cohesion: 0.29
Nodes (6): DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay, DialogTitle

### Community 29 - "Inventory List"
Cohesion: 0.40
Nodes (3): categoryIcons, statusConfig, userTypeLabels

### Community 30 - "Alert UI"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 31 - "OTP Input UI"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 32 - "Button Calendar UI"
Cohesion: 0.40
Nodes (3): Button, buttonVariants, Calendar()

### Community 33 - "Accordion UI"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 34 - "Avatar UI"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 35 - "Tabs UI"
Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 36 - "Toggle Group UI"
Cohesion: 0.50
Nodes (3): ToggleGroup, ToggleGroupContext, ToggleGroupItem

## Knowledge Gaps
- **343 isolated node(s):** `PreToolUse`, `$schema`, `style`, `rsc`, `tsx` (+338 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Utility UI` to `Button Calendar UI`, `Menu Bar UI`, `Badge UI`, `Command UI`, `Context Menu UI`, `Dropdown Menu UI`, `Alert Dialog UI`, `Breadcrumb UI`, `Drawer UI`, `Sheet UI`, `Dialog UI`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Dev Tooling`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `MenubarShortcut()` connect `Menu Bar UI` to `Utility UI`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `cn()` (e.g. with `AlertDialogFooter()` and `AlertDialogHeader()`) actually correct?**
  _`cn()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PreToolUse`, `$schema`, `style` to the rest of the system?**
  _343 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.030303030303030304 - nodes in this community are weakly interconnected._
- **Should `Pages and Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._