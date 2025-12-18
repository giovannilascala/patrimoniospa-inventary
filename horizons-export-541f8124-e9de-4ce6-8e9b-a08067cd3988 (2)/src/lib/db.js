
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Fetches all records from a table, handling Supabase's 1000-row default limit
 * by paginating through results in chunks.
 */
export const fetchAllRecords = async (tableName, select = '*', orderBy = 'created_at', ascending = false) => {
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select(select)
        .order(orderBy, { ascending })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }
    return allData;
  } catch (error) {
    console.error(`Error fetching all records from ${tableName}:`, error);
    throw error;
  }
};

/**
 * Efficiently gets the count of records matching filters without fetching data.
 */
export const getCount = async (tableName, filters = {}) => {
  try {
    let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
    
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });

    const { count, error } = await query;
    if (error) throw error;
    return count;
  } catch (error) {
    console.error(`Error getting count from ${tableName}:`, error);
    throw error;
  }
};
