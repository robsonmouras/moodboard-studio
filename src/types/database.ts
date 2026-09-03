/**
 * Forma das tabelas e funções do Postgres (Supabase) usadas pelo app — escrita à
 * mão a partir do schema em `prompts/fase3-autenticacao-persistencia.md`
 * §"Schema do banco", no mesmo formato que o `supabase gen types typescript`
 * produziria. Mantém o client tipado sem `any`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          search_term: string | null;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          search_term?: string | null;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          search_term?: string | null;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      board_images: {
        Row: {
          id: string;
          board_id: string;
          unsplash_id: string;
          image_url: string;
          thumb_url: string;
          author: string;
          description: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          unsplash_id: string;
          image_url: string;
          thumb_url: string;
          author: string;
          description: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          unsplash_id?: string;
          image_url?: string;
          thumb_url?: string;
          author?: string;
          description?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "board_images_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "boards";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_public_board: {
        Args: { board_slug: string };
        Returns: {
          title: string;
          created_at: string;
          image_url: string;
          thumb_url: string;
          author: string;
          description: string;
          sort_order: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
