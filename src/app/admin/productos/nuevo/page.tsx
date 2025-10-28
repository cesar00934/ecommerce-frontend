// app/admin/productos/nuevo/page.tsx (Versión Final y Profesional para Spring Boot)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  getCategorias,
  addCategoria,
  addProducto as crearProducto,
  uploadImage as subirImagen,
  NuevoProducto,
  Categoria
} from "@/lib/api";

import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Calendar, 
  Check, 
  PlusCircle, 
  X, 
  ScanLine, 
  Loader2, 
  UploadCloud, 
  Image as ImageIcon 
} from "lucide-react";
import Link from "next/link";

// --- MODAL DE CATEGORÍAS (usa la función addCategoria de nuestra API) ---
const CategoryModal = ({ onClose, onCategoryAdded }: { onClose: () => void; onCategoryAdded: (newCategory: Categoria) => void; }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === "" || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const nuevaCategoria = await addCategoria(newCategoryName);
      onCategoryAdded(nuevaCategoria);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Agregar Nueva Categoría</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X /></button>
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nombre de la categoría"
          className="w-full p-2 border border-gray-300 rounded-md"
          disabled={isSaving}
        />
        <button onClick={handleAddCategory} disabled={isSaving} className="w-full mt-4 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex justify-center items-center">
          {isSaving ? <Loader2 className="animate-spin" /> : 'Guardar Categoría'}
        </button>
      </div>
    </div>
  );
};

// --- FORMULARIO PRINCIPAL DE NIVEL PROFESIONAL ---
export default function NuevoProductoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof NuevoProducto, string>>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const [producto, setProducto] = useState<NuevoProducto>({
    nombre: "",
    descripcion: "",
    categoriaId: null,
    stock: 0,
    precioCompra: 0,
    precioVenta: 0,
    codigoQR: "",
    codigoBarras: "",
    fechaVencimiento: null,
    imagenUrl: null,
  });
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
useEffect(() => {
  const fetchData = async () => {
    try {
      const cats = await getCategorias();
      setCategorias(cats);
    } catch (err) {
      console.error(err);
      setGlobalError("No se pudieron cargar las categorías.");
    }
  };
  fetchData();
}, []);


const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;

  // Limpiamos errores del campo que se está editando
  if (fieldErrors[name as keyof NuevoProducto]) {
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  }

  // Si el usuario escribe fecha, también limpiamos el error de imagen (mensaje compartido)
  if (name === "fechaVencimiento") {
    setFieldErrors(prev => ({ ...prev, imagenUrl: undefined, fechaVencimiento: undefined }));
  }

  const numericFields = ['categoriaId', 'stock', 'precioCompra', 'precioVenta'];
  const finalValue = numericFields.includes(name) ? (value === '' ? null : Number(value)) : value;
  setProducto(prev => ({ ...prev, [name]: finalValue }));
};


 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // Límite de 5MB
      setFieldErrors(prev => ({ ...prev, imagenUrl: "La imagen no debe superar los 5MB." }));
      return;
    }
    // limpiamos errores relacionados con paso 3
    setFieldErrors(prev => ({ ...prev, imagenUrl: undefined, fechaVencimiento: undefined }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }
};

const validateFormStep3 = () => {
  // Reutiliza el tipo de errores que usas ya en pasos anteriores
  const errors: Partial<Record<keyof NuevoProducto, string>> = {};

  // Requerimos que haya O fechaVencimiento O imagen (archivo en memoria o imagenUrl ya existente)
  const hasFecha = !!producto.fechaVencimiento && producto.fechaVencimiento.toString().trim() !== "";
  const hasImage = !!imageFile || !!producto.imagenUrl;

  if (!hasFecha && !hasImage) {
    // Mensaje compartido para que se muestre en ambos posibles campos
    const mensaje = "Debes proporcionar una fecha de vencimiento o subir una imagen del producto.";
    errors.fechaVencimiento = mensaje;
    errors.imagenUrl = mensaje;
  }

  setFieldErrors(prev => ({ ...prev, ...errors }));
  return Object.keys(errors).length === 0;
};
  const handleCategoryAdded = (newCategory: Categoria) => {
    setCategorias(prev => [...prev, newCategory]);
    setProducto(prev => ({ ...prev, categoriaId: newCategory.id }));
  };

  const validateFormStep1 = () => {
    const errors: Partial<Record<keyof NuevoProducto, string>> = {};
    if (!producto.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
    if (!producto.categoriaId) errors.categoriaId = "Debes seleccionar una categoría.";
    setFieldErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const validateFormStep2 = () => {
    const errors: Partial<Record<keyof NuevoProducto, string>> = {};
    if (producto.precioVenta <= 0) errors.precioVenta = "El precio de venta debe ser mayor a cero.";
    if (producto.stock < 0) errors.stock = "El stock no puede ser negativo.";
    setFieldErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateFormStep1()) return;
    if (step === 2 && !validateFormStep2()) return;
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setGlobalError(null);

  // Si no estamos en el paso final, avanzamos 1 paso usando nextStep (que ya valida)
  if (step !== 3) {
    nextStep();
    return;
  }

  // Si estamos en el paso final, revalidamos todo (1,2 y 3) antes de proceder
  const ok1 = validateFormStep1();
  const ok2 = validateFormStep2();
  const ok3 = validateFormStep3();

  if (!ok1 || !ok2 || !ok3) {
    // si falla, llevamos al usuario al primer paso con error o al paso correspondiente
    if (!ok1) setStep(1);
    else if (!ok2) setStep(2);
    else setStep(3);
    return;
  }

  // ---- Si todo OK, procedemos a guardar ----
  setIsSaving(true);
  let finalImageUrl: string | null = null;

  try {
    if (imageFile) {
      setUploadProgress("Subiendo imagen...");
      const response = await subirImagen(imageFile);
      finalImageUrl = response.fileDownloadUri;
    }

    setUploadProgress("Guardando datos del producto...");
    const productoParaGuardar = {
      ...producto,
      imagenUrl: finalImageUrl,
    };

    await crearProducto(productoParaGuardar);

    alert("¡Producto guardado exitosamente!");
    router.push('/admin/productos');
  } catch (err: any) {
    setGlobalError(err.message || "Ocurrió un error inesperado.");
  } finally {
    setIsSaving(false);
    setUploadProgress(null);
  }
};


  const stepTitles = ["Información Esencial", "Inventario y Precios", "Metadatos y Revisión"];

  return (
    <ProtectedRoute roleRequired="ADMIN">
      <div className="bg-gray-100 min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/admin/productos" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft size={16} className="mr-2" /> Volver a la lista de productos
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Agregar Nuevo Producto</h1>
          </div>
          
          <div className="mb-8">
            <ol className="flex items-center w-full">
              {stepTitles.map((title, index) => (
                <li key={index} className={`flex w-full items-center ${index + 1 < stepTitles.length ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 after:inline-block" : ""}`}>
                  <span className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {step > index + 1 ? <Check size={20} /> : index + 1}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              {step === 1 && <Package className="mr-2" />}
              {step === 2 && <DollarSign className="mr-2" />}
              {step === 3 && <Calendar className="mr-2" />}
              Paso {step}: {stepTitles[step - 1]}
            </h3>
            {globalError && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-6">{globalError}</div>}
            <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} noValidate>
              
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                    <input name="nombre" value={producto.nombre} onChange={handleInputChange} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 ${fieldErrors.nombre ? 'border-red-500' : ''}`} />
                    {fieldErrors.nombre && <p className="text-red-500 text-xs mt-1">{fieldErrors.nombre}</p>}
                  </div>
                  <div>
                    <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700">Categoría</label>
                    <div className="flex items-center gap-2 mt-1">
                      <select name="categoriaId" value={producto.categoriaId || ''} onChange={handleInputChange} className={`flex-grow border-gray-300 rounded-md shadow-sm p-3 ${fieldErrors.categoriaId ? 'border-red-500' : ''}`}>
                        <option value="" disabled>Selecciona una categoría</option>
                        {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                      </select>
                      <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-shrink-0"><PlusCircle size={20} /></button>
                    </div>
                    {fieldErrors.categoriaId && <p className="text-red-500 text-xs mt-1">{fieldErrors.categoriaId}</p>}
                  </div>
                  <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea name="descripcion" value={producto.descripcion} onChange={handleInputChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input name="stock" type="number" value={producto.stock} onChange={handleInputChange} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 ${fieldErrors.stock ? 'border-red-500' : ''}`} />
                    {fieldErrors.stock && <p className="text-red-500 text-xs mt-1">{fieldErrors.stock}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio Compra (S/)</label>
                    <input name="precioCompra" type="number" step="0.01" value={producto.precioCompra} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio Venta (S/)</label>
                    <input name="precioVenta" type="number" step="0.01" value={producto.precioVenta} onChange={handleInputChange} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 ${fieldErrors.precioVenta ? 'border-red-500' : ''}`} />
                    {fieldErrors.precioVenta && <p className="text-red-500 text-xs mt-1">{fieldErrors.precioVenta}</p>}
                  </div>
                  <div>
                    <label htmlFor="codigoBarras" className="block text-sm font-medium text-gray-700">Código de Barras</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input name="codigoBarras" value={producto.codigoBarras} onChange={handleInputChange} className="block w-full border-gray-300 rounded-md shadow-sm p-3" />
                      {/* <button type="button" onClick={() => openScanner('codigoBarras')} className="p-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 flex-shrink-0"><ScanLine size={20} /></button> */}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="codigoQR" className="block text-sm font-medium text-gray-700">Código QR (Opcional)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input name="codigoQR" value={producto.codigoQR} onChange={handleInputChange} className="block w-full border-gray-300 rounded-md shadow-sm p-3" />
                      {/* <button type="button" onClick={() => openScanner('codigoQR')} className="p-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 flex-shrink-0"><ScanLine size={20} /></button> */}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700">Fecha de Vencimiento (si aplica)</label>
                    <input name="fechaVencimiento" type="date" value={producto.fechaVencimiento || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
                    <div className="mt-1">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border">
                          {imagePreview ? <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover rounded-lg" /> : <ImageIcon className="h-10 w-10 text-gray-400" />}
                        </div>
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                          <span>{imageFile ? 'Cambiar imagen' : 'Subir imagen'}</span>
                          <input id="file-upload" name="file-upload" type="file" accept="image/png, image/jpeg, image/webp" className="sr-only" onChange={handleImageChange} />
                        </label>
                      </div>
                      {fieldErrors.imagenUrl && <p className="text-red-500 text-xs mt-1">{fieldErrors.imagenUrl}</p>}
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP hasta 5MB.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-5 border-t">
                <div className="flex justify-between items-center">
                  <button type="button" onClick={prevStep} disabled={step === 1 || isSaving} className="px-5 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Anterior</button>
                  {isSaving && uploadProgress && <span className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> {uploadProgress}</span>}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep} disabled={isSaving} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">Siguiente</button>
                  ) : (
                    <button type="submit" disabled={isSaving} className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 flex justify-center items-center w-48">
                      {isSaving ? <Loader2 className="animate-spin" /> : 'Finalizar y Guardar'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        {isCategoryModalOpen && <CategoryModal onClose={() => setIsCategoryModalOpen(false)} onCategoryAdded={handleCategoryAdded} />}
      </div>
    </ProtectedRoute>
  );
}
