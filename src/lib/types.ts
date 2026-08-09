export interface Profile {
  id: string;
  name: string;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at?: string;
}

export interface Variety {
  id: string;
  name: string;
  species: string;
  breeder_id: string;
  year_created: number | null;
  description: string | null;
  care_notes: string | null;
  main_photo_url: string | null;
  parent_a_id: string | null;
  parent_b_id: string | null;
  // Паспорт сорта — характеристики цветка (все опциональны).
  origin: string | null;
  pod_parent: string | null;
  pollen_parent: string | null;
  bloom_type: string | null;
  size_range: string | null;
  hybridizer: string | null;
  date_registered: string | null;
  grower: string | null;
  reg_mini: string | null;
  color_group: string | null;
  propagation: string | null;
  bloom_colors: string | null;
  // Расширенный паспорт IHS
  photographer: string | null;
  pod_parent_registered: string | null;
  pollen_parent_registered: string | null;
  grower_same: string | null;
  vein_color: string | null;
  spots_color: string | null;
  eye_color: string | null;
  num_colors: string | null;
  color_rings: string | null;
  pad_color: string | null;
  bloom_form: string | null;
  bloom_features: string | null;
  petal_overlap: string | null;
  veining: string | null;
  substance: string | null;
  bloom_duration: string | null;
  presentation: string | null;
  eye_zone_size: string | null;
  prop_seedling: string | null;
  prop_pollen: string | null;
  prop_rooting: string | null;
  prop_performance: string | null;
  leaf_size: string | null;
  leaf_look: string | null;
  bush_development: string | null;
  bush_size: string | null;
  bush_width: string | null;
  bush_form: string | null;
  created_at?: string;
}

export interface Photo {
  id: string;
  variety_id: string;
  photo_url: string;
  caption: string | null;
}

/** Сорт вместе со связанными данными — то, что отдаёт data-слой страницам. */
export interface VarietyWithRelations extends Variety {
  breeder: Profile | null;
  parent_a: Variety | null;
  parent_b: Variety | null;
  photos: Photo[];
}

export interface VarietyFilters {
  search?: string;
  species?: string;
  breederId?: string;
  year?: number;
}

export type NewVarietyInput = {
  name: string;
  species: string;
  year_created: number | null;
  description: string;
  care_notes: string;
  parent_a_id: string | null;
  parent_b_id: string | null;
  main_photo_url: string | null;
  gallery_urls: string[];
  origin: string | null;
  pod_parent: string | null;
  pollen_parent: string | null;
  bloom_type: string | null;
  size_range: string | null;
  hybridizer: string | null;
  date_registered: string | null;
  grower: string | null;
  reg_mini: string | null;
  color_group: string | null;
  propagation: string | null;
  bloom_colors: string | null;
};
