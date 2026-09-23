import { useState, useRef, useEffect } from "react";
import { X, Upload, Plus, Trash2, Car, Tag, Banknote, List, ImageIcon, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { createVehicle, updateVehicle, type Vehicle } from "../../services/vehicles.service";

interface VehicleFormModalProps {
  initialData?: Vehicle | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VehicleFormModal({ initialData, onClose, onSuccess }: VehicleFormModalProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("bike");
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [status, setStatus] = useState("available");
  
  // Specifications (Dynamic Key-Value pairs)
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  
  // Images
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  // For Edit Mode: Existing Images
  const [existingImages, setExistingImages] = useState<{ url: string, publicId: string }[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);

  // Initialize data if in edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCategory(initialData.category || "bike");
      setBrand(initialData.brand || "");
      setModelName(initialData.modelName || "");
      setRegistrationNumber(initialData.registrationNumber || "");
      setDescription(initialData.description || "");
      setPricePerDay(initialData.pricePerDay ? String(initialData.pricePerDay) : "");
      setSecurityDeposit((initialData as any).securityDeposit ? String((initialData as any).securityDeposit) : "");
      setStatus(initialData.status || "available");
      
      if (initialData.specifications && Object.keys(initialData.specifications).length > 0) {
        const specArr = Object.entries(initialData.specifications).map(([key, value]) => ({
          key,
          value: value as string,
        }));
        setSpecs(specArr);
      } else {
        setSpecs([{ key: "", value: "" }]);
      }

      if (initialData.images && initialData.images.length > 0) {
        // Handle both string and object image formats for backward compatibility
        const parsedImages = initialData.images.map((img: any) => {
          if (typeof img === 'string') return { url: img, publicId: img };
          return img;
        });
        setExistingImages(parsedImages);
      }
    }
  }, [initialData]);

  const totalImagesCount = existingImages.length + newImages.length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (totalImagesCount + selectedFiles.length > 5) {
        toast.error("You can only have a maximum of 5 images.");
        return;
      }
      
      const updatedNewImages = [...newImages, ...selectedFiles].slice(0, 5 - existingImages.length);
      setNewImages(updatedNewImages);
      
      const newPreviews = updatedNewImages.map((file) => URL.createObjectURL(file));
      setNewImagePreviews(newPreviews);
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewImage = (index: number) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
    
    const previews = [...newImagePreviews];
    previews.splice(index, 1);
    setNewImagePreviews(previews);
  };

  const removeExistingImage = (index: number) => {
    const imgToRemove = existingImages[index];
    setRemoveImageIds((prev) => [...prev, imgToRemove.publicId]);

    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index: number) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !pricePerDay) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (totalImagesCount === 0) {
      toast.error("Please add at least one image.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      if (brand) formData.append("brand", brand);
      if (modelName) formData.append("modelName", modelName);
      if (registrationNumber) formData.append("registrationNumber", registrationNumber);
      if (description) formData.append("description", description);
      formData.append("pricePerDay", pricePerDay);
      if (securityDeposit) formData.append("securityDeposit", securityDeposit);

      // Filter empty specs and convert to object
      const specObj: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key.trim() && s.value.trim()) specObj[s.key.trim()] = s.value.trim();
      });
      if (Object.keys(specObj).length > 0) {
        formData.append("specifications", JSON.stringify(specObj));
      }

      // Add new images
      newImages.forEach((img) => formData.append("images", img));

      // Handle removed existing images
      if (isEditMode && removeImageIds.length > 0) {
        formData.append("removeImageIds", JSON.stringify(removeImageIds));
      }

      if (isEditMode && status) {
        formData.append("status", status);
      }

      if (isEditMode && initialData) {
        await updateVehicle(initialData._id, formData);
        toast.success("Vehicle updated successfully!");
      } else {
        await createVehicle(formData);
        toast.success("Vehicle created successfully!");
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} vehicle`);
    } finally {
      setLoading(false);
    }
  };

  // Shared Input Class
  const inputClass = "w-full px-4 py-3 rounded-xl bg-white border border-slate-300 shadow-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm font-bold text-slate-900 transition-all placeholder-slate-400";
  const labelClass = "block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{isEditMode ? "Update Vehicle" : "Add New Vehicle"}</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{isEditMode ? "Modify existing vehicle details" : "List a new vehicle for rent"}</p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Info Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-amber-400 pb-3 inline-flex">
                <Car className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-slate-900">Basic Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Vehicle Name <span className="text-red-500">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. Royal Enfield Classic 350" required />
                </div>
                <div>
                  <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass} required>
                    <option value="bike">Bike</option>
                    <option value="ev_bike">EV Bike</option>
                    <option value="cycle">Cycle</option>
                  </select>
                </div>
                {isEditMode && (
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className={labelClass}>Brand</label>
                  <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className={inputClass} placeholder="e.g. Royal Enfield" />
                </div>
                <div>
                  <label className={labelClass}>Model Name</label>
                  <input type="text" value={modelName} onChange={e => setModelName(e.target.value)} className={inputClass} placeholder="e.g. Classic 350" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}><Tag className="w-3.5 h-3.5" /> Registration Number</label>
                  <input type="text" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} className={`${inputClass} uppercase`} placeholder="e.g. KL 01 AB 1234" />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-emerald-400 pb-3 inline-flex">
                <Banknote className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-black text-slate-900">Pricing</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className={labelClass}>Price Per Day <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input type="number" min="0" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} className={`${inputClass} pl-8`} placeholder="500" required />
                  </div>
                </div>
                <div className="relative">
                  <label className={labelClass}>Security Deposit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input type="number" min="0" value={securityDeposit} onChange={e => setSecurityDeposit(e.target.value)} className={`${inputClass} pl-8`} placeholder="1500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b-2 border-blue-400 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-black text-slate-900">Images <span className="text-red-500 text-sm">*</span></h3>
                </div>
                <span className="text-xs font-black px-3 py-1 bg-slate-100 rounded-full text-slate-600">{totalImagesCount}/5 Uploaded</span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative w-28 h-28 rounded-2xl border-2 border-slate-200 overflow-hidden group shadow-sm">
                    <img src={img.url} alt="Existing" className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">EXISTING</div>
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button type="button" onClick={() => removeExistingImage(idx)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition shadow-lg hover:scale-110">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* New Image Previews */}
                {newImagePreviews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative w-28 h-28 rounded-2xl border-2 border-blue-200 overflow-hidden group shadow-sm">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">NEW</div>
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button type="button" onClick={() => removeNewImage(idx)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition shadow-lg hover:scale-110">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {totalImagesCount < 5 && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50 hover:bg-amber-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-slate-400 hover:text-amber-500 shadow-sm hover:shadow"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-center px-2">Upload Photo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Specifications Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-purple-400 pb-3 inline-flex">
                <List className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-black text-slate-900">Specifications</h3>
              </div>
              
              <div className="space-y-4">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-3">
                    <input type="text" placeholder="Spec Name (e.g. Engine)" value={spec.key} onChange={e => updateSpec(idx, "key", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Value (e.g. 350cc)" value={spec.value} onChange={e => updateSpec(idx, "value", e.target.value)} className={inputClass} />
                    <button type="button" onClick={() => removeSpec(idx)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addSpec} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black uppercase tracking-wider rounded-xl transition">
                  <Plus className="w-4 h-4" /> Add Spec
                </button>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-rose-400 pb-3 inline-flex">
                <FileText className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-black text-slate-900">Description</h3>
              </div>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Provide additional details, condition, features, etc..." />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-white flex items-center justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-100 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" form="vehicle-form" disabled={loading} className="px-8 py-3 text-sm font-black text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.23)] disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving...
              </span>
            ) : (
              isEditMode ? "Save Changes" : "Create Vehicle"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
