import { useState, useEffect, useMemo } from "react";
import { InventoryDB, PasswordsDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryList from "@/components/inventory/InventoryList";
import InventoryDialog from "@/components/inventory/InventoryDialog";
import PasswordList from "@/components/inventory/PasswordList";
import PasswordDialog from "@/components/inventory/PasswordDialog";
import CsvImportButton from "@/components/CsvImportButton";
import { mapInventoryCsv, mapPasswordsCsv } from "@/lib/csv-mappers";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showPassDialog, setShowPassDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingPass, setEditingPass] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [modelFilter, setModelFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
  const [cartFilter, setCartFilter] = useState("todos");

  const fetchAll = async () => {
    const [inv, pass] = await Promise.all([InventoryDB.list("name", 5000), PasswordsDB.list()]);
    setItems(inv);
    setPasswords(pass);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpenItem = (item = null) => { setEditingItem(item); setShowItemDialog(true); };
  const handleOpenPass = (pass = null) => { setEditingPass(pass); setShowPassDialog(true); };

  const notebookModels = useMemo(
    () => [...new Set(items.filter((item) => item.category === "Notebook").map((item) => item.brand).filter(Boolean))].sort(),
    [items],
  );

  const locations = useMemo(
    () => [...new Set(items.map((item) => item.location).filter(Boolean))].sort(),
    [items],
  );

  const carts = useMemo(
    () => [...new Set(items.filter((item) => item.category === "Notebook").map((item) => item.cart).filter(Boolean))].sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const term = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return items.filter((item) => {
      const searchable = [
        item.name,
        item.category,
        item.brand,
        item.serial_number,
        item.asset_tag,
        item.cart,
        item.location,
        item.current_user,
      ].join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (categoryFilter === "todos" || item.category === categoryFilter) &&
        (statusFilter === "todos" || item.status === statusFilter) &&
        (modelFilter === "todos" || item.brand === modelFilter) &&
        (locationFilter === "todos" || item.location === locationFilter) &&
        (cartFilter === "todos" || item.cart === cartFilter)
      );
    });
  }, [items, search, categoryFilter, statusFilter, modelFilter, locationFilter, cartFilter]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Controle de Estoque</h2>
        <p className="text-muted-foreground text-sm mt-1">Equipamentos disponíveis e senhas de acesso</p>
      </div>

      <InventoryStats items={filteredItems} />

      <Tabs defaultValue="equipamentos">
        <TabsList className="mb-4">
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="senhas">Senhas de Acesso</TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,1fr)_150px_150px_180px_160px_160px] gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, modelo, serial, patrimonio, carrinho, local ou usuario"
                className="h-11 rounded-xl pl-10 bg-card"
              />
            </div>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 rounded-xl border border-input bg-card px-3 text-sm">
              <option value="todos">Categorias</option>
              <option value="Notebook">Notebooks</option>
              <option value="Fonte/Carregador">Fontes</option>
              <option value="Cabo HDMI">Cabos HDMI</option>
              <option value="Cabo de Rede">Cabos de Rede</option>
              <option value="Outro">Outros</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-input bg-card px-3 text-sm">
              <option value="todos">Status</option>
              <option value="disponivel">Disponivel</option>
              <option value="em_uso">Em uso</option>
              <option value="manutencao">Manutencao</option>
              <option value="inativo">Inativo</option>
              <option value="nao_encontrado">Nao encontrado</option>
            </select>
            <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} className="h-11 rounded-xl border border-input bg-card px-3 text-sm">
              <option value="todos">Modelos</option>
              {notebookModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} className="h-11 rounded-xl border border-input bg-card px-3 text-sm">
              <option value="todos">Locais</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <select value={cartFilter} onChange={(event) => setCartFilter(event.target.value)} className="h-11 rounded-xl border border-input bg-card px-3 text-sm">
              <option value="todos">Carrinhos</option>
              {carts.map((cart) => (
                <option key={cart} value={cart}>{cart}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mb-4">
            <CsvImportButton
              label="Importar equipamentos"
              transformRows={mapInventoryCsv}
              onImport={(records) => InventoryDB.createMany(records)}
              onImported={fetchAll}
            />
            <Button onClick={() => handleOpenItem()} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <PlusCircle className="h-4 w-4" /> Adicionar Equipamento
            </Button>
          </div>
          <InventoryList items={filteredItems} onEdit={handleOpenItem} onRefresh={fetchAll} />
        </TabsContent>

        <TabsContent value="senhas">
          <div className="flex flex-col sm:flex-row justify-end gap-2 mb-4">
            <CsvImportButton
              label="Importar senhas"
              transformRows={mapPasswordsCsv}
              onImport={(records) => PasswordsDB.createMany(records)}
              onImported={fetchAll}
            />
            <Button onClick={() => handleOpenPass()} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <PlusCircle className="h-4 w-4" /> Adicionar Senha
            </Button>
          </div>
          <PasswordList passwords={passwords} onEdit={handleOpenPass} onRefresh={fetchAll} />
        </TabsContent>
      </Tabs>

      {showItemDialog && (
        <InventoryDialog
          open={showItemDialog}
          item={editingItem}
          onClose={() => { setShowItemDialog(false); setEditingItem(null); }}
          onSaved={fetchAll}
        />
      )}

      {showPassDialog && (
        <PasswordDialog
          open={showPassDialog}
          password={editingPass}
          onClose={() => { setShowPassDialog(false); setEditingPass(null); }}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
