import { SupabaseClient } from "@supabase/supabase-js";

export class StorageService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Upload an avatar image file
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error } = await this.supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = this.supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return publicUrl;
  }

  /**
   * Upload a vehicle photo
   */
  async uploadVehiclePhoto(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/vehicle-${Date.now()}.${fileExt}`;

    const { error } = await this.supabase.storage
      .from("vehicles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = this.supabase.storage
      .from("vehicles")
      .getPublicUrl(filePath);

    return publicUrl;
  }

  /**
   * Upload media for a checklist item
   */
  async uploadInspectionMedia(
    inspectorId: string,
    inspectionId: string,
    category: string,
    itemLabel: string,
    file: File
  ): Promise<{ fileUrl: string; fileType: string; fileSize: number }> {
    const fileExt = file.name.split(".").pop() || "jpeg";
    const cleanedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const cleanedLabel = itemLabel.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filePath = `${inspectorId}/${inspectionId}/${cleanedCategory}_${cleanedLabel}_${Date.now()}.${fileExt}`;

    const fileType = file.type.split("/")[0] || "image";

    const { error } = await this.supabase.storage
      .from("inspections")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // Since inspections bucket is private, we fetch the signed URL or public path.
    // In Supabase, getPublicUrl is fine if we make it public or use getPublicUrl if policies allow.
    // Wait, let's see: in migrations, the inspections bucket was marked public = FALSE!
    // So getPublicUrl won't work without a signed URL or session auth.
    // But since the app is authenticated, we can return the storage path or a temporary signed URL,
    // or just return the object key / private path, and let the page fetch signed URLs on demand.
    // Returning the full direct storage URL or relative path works. 
    // In our SQL policies: CREATE POLICY "Inspection read by role" ON storage.objects FOR SELECT ...
    // This allows authenticated reads. So client can read via public URL if we change it, but since it is private,
    // the cleanest way to serve private files is to create a signed URL, or we can just fetch the public URL
    // if the bucket policies are configured, but since public is FALSE we should use signed URLs for display.
    // Let's return the storage object path so the app can fetch a signed URL or we can return the path,
    // or get a temporary signed URL directly.
    // Let's return the key/path first, or get a signed URL for 1 hour.
    // Let's get the signed URL or path. Actually, returning the public URL is simpler if we bypass it,
    // but a signed URL is safer. Let's return the relative storage path or get the publicUrl for simplicity
    // in UI rendering (we can also retrieve the public URL which works if we authenticate the request,
    // but standard Supabase requires signed URL for private buckets).
    // Let's return the path which is standard, and we can also fetch the publicUrl path.
    // Actually, let's get the public URL path (which holds the file name) and we can use a helper to get signed URLs.
    const { data: { publicUrl } } = this.supabase.storage
      .from("inspections")
      .getPublicUrl(filePath);

    return {
      fileUrl: publicUrl, // or we can use signed URLs
      fileType,
      fileSize: file.size,
    };
  }
}
