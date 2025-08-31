import { addResourceSchema } from "@/components/resources/admin/addResourceForm/AddResourceHelper";
import { TypedSupabaseClient } from "@/utils/types";
import { QueryResponse, type QueryResponseType } from "@/utils/query-response";
import type { Database } from "@/database.types";
import { z } from "zod";

type ResourceFormData = z.infer<typeof addResourceSchema>;
export type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];

export async function createOneResource(
  client: TypedSupabaseClient,
  userId: string,
  resourceData: ResourceFormData
): Promise<QueryResponseType<ResourceRow | null>> {
  try {
    // Transform form data to match database schema
    const insertData: Database["public"]["Tables"]["resources"]["Insert"] = {
      title: resourceData.title,
      description: resourceData.description || null,
      category: resourceData.category,
      resource_type: resourceData.resourceType,
      resource_url: resourceData.resourceUrl,
      author: resourceData.author,
      status: resourceData.status,
      is_featured: resourceData.isFeatured,
      is_archived: false,
      levels: resourceData.levels.map((level) => level.value),
      tags: resourceData.tags?.map((tag) => tag.value) || null,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 0,
    };

    const { data, error } = await client
      .from("resources")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return QueryResponse.success<ResourceRow>(data);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}

export async function getAllResources(
  client: TypedSupabaseClient
): Promise<QueryResponseType<ResourceRow[] | null>> {
  try {
    const { data, error } = await client
      .from("resources")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return QueryResponse.success<ResourceRow[]>(data);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}

export async function getPublishedResources(
  client: TypedSupabaseClient
): Promise<QueryResponseType<ResourceRow[] | null>> {
  try {
    const { data, error } = await client
      .from("resources")
      .select("*")
      .eq("status", "Published")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return QueryResponse.success<ResourceRow[]>(data);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}

export async function getFeaturedResources(
  client: TypedSupabaseClient
): Promise<QueryResponseType<ResourceRow[] | null>> {
  try {
    const { data, error } = await client
      .from("resources")
      .select("*")
      .eq("status", "Published")
      .eq("is_featured", true)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return QueryResponse.success<ResourceRow[]>(data);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}

export async function getResourceById(
  client: TypedSupabaseClient,
  resourceId: string
): Promise<QueryResponseType<ResourceRow | null>> {
  try {
    const { data, error } = await client
      .from("resources")
      .select("*")
      .eq("id", resourceId)
      .single();

    if (error) throw error;
    return QueryResponse.success<ResourceRow>(data);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}

export async function updateResource(
  client: TypedSupabaseClient,
  resourceId: string,
  updateData: Partial<ResourceFormData>
): Promise<QueryResponseType<ResourceRow | null>> {
  try {
    const transformedData: Database["public"]["Tables"]["resources"]["Update"] =
      {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description !== undefined && {
          description: updateData.description || null,
        }),
        ...(updateData.category && { category: updateData.category }),
        ...(updateData.resourceType && {
          resource_type: updateData.resourceType,
        }),
        ...(updateData.resourceUrl && { resource_url: updateData.resourceUrl }),
        ...(updateData.author && { author: updateData.author }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.isFeatured !== undefined && {
          is_featured: updateData.isFeatured,
        }),
        ...(updateData.levels && {
          levels: updateData.levels.map((level) => level.value),
        }),
        ...(updateData.tags !== undefined && {
          tags: updateData.tags?.map((tag) => tag.value) || null,
        }),
        updated_at: new Date().toISOString(),
      };

    const { data, error } = await client
      .from("resources")
      .update(transformedData)
      .eq("id", resourceId)
      .select()
      .single();

    if (error) throw error;
    return QueryResponse.success<ResourceRow>(data);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}

export async function deleteResource(
  client: TypedSupabaseClient,
  resourceId: string
): Promise<QueryResponseType<null>> {
  try {
    const { error } = await client
      .from("resources")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", resourceId);

    if (error) throw error;
    return QueryResponse.success<null>(null);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}

export async function incrementResourceViewCount(
  client: TypedSupabaseClient,
  resourceId: string
): Promise<QueryResponseType<null>> {
  try {
    // First get current view count
    const { data: currentResource, error: fetchError } = await client
      .from("resources")
      .select("view_count")
      .eq("id", resourceId)
      .single();

    if (fetchError) throw fetchError;

    const newViewCount = (currentResource.view_count || 0) + 1;

    const { error } = await client
      .from("resources")
      .update({
        view_count: newViewCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resourceId);

    if (error) throw error;
    return QueryResponse.success<null>(null);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}

export async function getResourcesByCategory(
  client: TypedSupabaseClient,
  category: string
): Promise<QueryResponseType<ResourceRow[] | null>> {
  try {
    const { data, error } = await client
      .from("resources")
      .select("*")
      .eq("status", "Published")
      .eq("category", category)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return QueryResponse.success<ResourceRow[]>(data);
  } catch (error: any) {
    return QueryResponse.error(error.message);
  }
}
