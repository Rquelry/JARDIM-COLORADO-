import { useState, useEffect } from "react";
import { InventoryDB, PasswordsDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryList from "@/components/inventory/InventoryList";
import InventoryDialog from "@/components/inventory/InventoryDialog";
import PasswordList from "@/components/inventory/PasswordList";
import PasswordDialog from "@/components/inventory/PasswordDialog";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showPassDialog, setShowPassDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingPass, setEditingPass] = useState(null);

  const fetchAll = async () => {
    const [inv, pass] = await Promise.all([InventoryDB.list(), PasswordsDB.list()]);
    setItems(inv);
    setPasswords(pass);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpenItem = (item = null) => { setEditingItem(item); setShowItemDialog(true); };
  const handleOpenPass = (pass = null) => { setEditingPass(pass); setShowPassDialog(true); };

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

      <InventoryStats items={items} />

      <Tabs defaultValue="equipamentos">
        <TabsList className="mb-4">
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="senhas">Senhas de Acesso</TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos">
          <div className="flex justify-end mb-4">
            <Button onClick={() => handleOpenItem()} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <PlusCircle className="h-4 w-4" /> Adicionar Equipamento
            </Button>
          </div>
          <InventoryList items={items} onEdit={handleOpenItem} onRefresh={fetchAll} />
        </TabsContent>

        <TabsContent value="senhas">
          <div className="flex justify-end mb-4">
            <Button onClick={() => handleOpenPass()} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <PlusCircle className="h-4 w-4" /> Adicionar Senha
            </Button>
          </div>
          <PasswordList passwords={passwords} onEdit={handleOpenPass} onRefresh={fetchAll} />
        </TabsContent>
      </Tabs>

      <InventoryDialog
        open={showItemDialog}
        item={editingItem}
        onClose={() => { setShowItemDialog(false); setEditingItem(null); }}
        onSaved={fetchAll}
      />

      <PasswordDialog
        open={showPassDialog}
        password={editingPass}
        onClose={() => { setShowPassDialog(false); setEditingPass(null); }}
        onSaved={fetchAll}
      />
    </div>
  );
}