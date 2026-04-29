/**
 * Subdelegación del Gobierno email mapping.
 *
 * Maps each Spanish province to the relevant immigration office
 * (Oficina de Extranjería / Subdelegación del Gobierno).
 * Province keys match PROVINCIAS in lib/types/personal-data.ts.
 */

export interface SubdelegacionInfo {
  email: string;
  name: string;
}

export const SUBDELEGACION_MAP: Record<string, SubdelegacionInfo> = {
  "A Coruña": { email: "extranjeria.coruna@correo.gob.es", name: "Subdelegación del Gobierno en A Coruña" },
  "Álava": { email: "extranjeria.alava@correo.gob.es", name: "Subdelegación del Gobierno en Álava" },
  "Albacete": { email: "extranjeria.albacete@correo.gob.es", name: "Subdelegación del Gobierno en Albacete" },
  "Alicante": { email: "extranjeria.alicante@correo.gob.es", name: "Subdelegación del Gobierno en Alicante" },
  "Almería": { email: "extranjeria.almeria@correo.gob.es", name: "Subdelegación del Gobierno en Almería" },
  "Asturias": { email: "extranjeria.asturias@correo.gob.es", name: "Delegación del Gobierno en Asturias" },
  "Ávila": { email: "extranjeria.avila@correo.gob.es", name: "Subdelegación del Gobierno en Ávila" },
  "Badajoz": { email: "extranjeria.badajoz@correo.gob.es", name: "Subdelegación del Gobierno en Badajoz" },
  "Barcelona": { email: "extranjeria.barcelona@correo.gob.es", name: "Oficina de Extranjería de Barcelona" },
  "Bizkaia": { email: "extranjeria.bizkaia@correo.gob.es", name: "Subdelegación del Gobierno en Bizkaia" },
  "Burgos": { email: "extranjeria.burgos@correo.gob.es", name: "Subdelegación del Gobierno en Burgos" },
  "Cáceres": { email: "extranjeria.caceres@correo.gob.es", name: "Subdelegación del Gobierno en Cáceres" },
  "Cádiz": { email: "extranjeria.cadiz@correo.gob.es", name: "Subdelegación del Gobierno en Cádiz" },
  "Cantabria": { email: "extranjeria.cantabria@correo.gob.es", name: "Delegación del Gobierno en Cantabria" },
  "Castellón": { email: "extranjeria.castellon@correo.gob.es", name: "Subdelegación del Gobierno en Castellón" },
  "Ceuta": { email: "extranjeria.ceuta@correo.gob.es", name: "Delegación del Gobierno en Ceuta" },
  "Ciudad Real": { email: "extranjeria.ciudadreal@correo.gob.es", name: "Subdelegación del Gobierno en Ciudad Real" },
  "Córdoba": { email: "extranjeria.cordoba@correo.gob.es", name: "Subdelegación del Gobierno en Córdoba" },
  "Cuenca": { email: "extranjeria.cuenca@correo.gob.es", name: "Subdelegación del Gobierno en Cuenca" },
  "Gipuzkoa": { email: "extranjeria.gipuzkoa@correo.gob.es", name: "Subdelegación del Gobierno en Gipuzkoa" },
  "Girona": { email: "extranjeria.girona@correo.gob.es", name: "Subdelegación del Gobierno en Girona" },
  "Granada": { email: "extranjeria.granada@correo.gob.es", name: "Subdelegación del Gobierno en Granada" },
  "Guadalajara": { email: "extranjeria.guadalajara@correo.gob.es", name: "Subdelegación del Gobierno en Guadalajara" },
  "Huelva": { email: "extranjeria.huelva@correo.gob.es", name: "Subdelegación del Gobierno en Huelva" },
  "Huesca": { email: "extranjeria.huesca@correo.gob.es", name: "Subdelegación del Gobierno en Huesca" },
  "Illes Balears": { email: "extranjeria.baleares@correo.gob.es", name: "Delegación del Gobierno en Illes Balears" },
  "Jaén": { email: "extranjeria.jaen@correo.gob.es", name: "Subdelegación del Gobierno en Jaén" },
  "La Rioja": { email: "extranjeria.rioja@correo.gob.es", name: "Delegación del Gobierno en La Rioja" },
  "Las Palmas": { email: "extranjeria.laspalmas@correo.gob.es", name: "Subdelegación del Gobierno en Las Palmas" },
  "León": { email: "extranjeria.leon@correo.gob.es", name: "Subdelegación del Gobierno en León" },
  "Lleida": { email: "extranjeria.lleida@correo.gob.es", name: "Subdelegación del Gobierno en Lleida" },
  "Lugo": { email: "extranjeria.lugo@correo.gob.es", name: "Subdelegación del Gobierno en Lugo" },
  "Madrid": { email: "extranjeria.madrid@correo.gob.es", name: "Oficina de Extranjería de Madrid" },
  "Málaga": { email: "extranjeria.malaga@correo.gob.es", name: "Subdelegación del Gobierno en Málaga" },
  "Melilla": { email: "extranjeria.melilla@correo.gob.es", name: "Delegación del Gobierno en Melilla" },
  "Murcia": { email: "extranjeria.murcia@correo.gob.es", name: "Delegación del Gobierno en Murcia" },
  "Navarra": { email: "extranjeria.navarra@correo.gob.es", name: "Delegación del Gobierno en Navarra" },
  "Ourense": { email: "extranjeria.ourense@correo.gob.es", name: "Subdelegación del Gobierno en Ourense" },
  "Palencia": { email: "extranjeria.palencia@correo.gob.es", name: "Subdelegación del Gobierno en Palencia" },
  "Pontevedra": { email: "extranjeria.pontevedra@correo.gob.es", name: "Subdelegación del Gobierno en Pontevedra" },
  "Salamanca": { email: "extranjeria.salamanca@correo.gob.es", name: "Subdelegación del Gobierno en Salamanca" },
  "Santa Cruz de Tenerife": { email: "extranjeria.tenerife@correo.gob.es", name: "Subdelegación del Gobierno en Santa Cruz de Tenerife" },
  "Segovia": { email: "extranjeria.segovia@correo.gob.es", name: "Subdelegación del Gobierno en Segovia" },
  "Sevilla": { email: "extranjeria.sevilla@correo.gob.es", name: "Subdelegación del Gobierno en Sevilla" },
  "Soria": { email: "extranjeria.soria@correo.gob.es", name: "Subdelegación del Gobierno en Soria" },
  "Tarragona": { email: "extranjeria.tarragona@correo.gob.es", name: "Subdelegación del Gobierno en Tarragona" },
  "Teruel": { email: "extranjeria.teruel@correo.gob.es", name: "Subdelegación del Gobierno en Teruel" },
  "Toledo": { email: "extranjeria.toledo@correo.gob.es", name: "Subdelegación del Gobierno en Toledo" },
  "Valencia": { email: "extranjeria.valencia@correo.gob.es", name: "Subdelegación del Gobierno en Valencia" },
  "Valladolid": { email: "extranjeria.valladolid@correo.gob.es", name: "Subdelegación del Gobierno en Valladolid" },
  "Zamora": { email: "extranjeria.zamora@correo.gob.es", name: "Subdelegación del Gobierno en Zamora" },
  "Zaragoza": { email: "extranjeria.zaragoza@correo.gob.es", name: "Subdelegación del Gobierno en Zaragoza" },
};

/**
 * Look up subdelegación for a province. Falls back to Madrid.
 */
export function getSubdelegacion(provincia: string): SubdelegacionInfo {
  return (
    SUBDELEGACION_MAP[provincia] ||
    SUBDELEGACION_MAP["Madrid"]
  );
}
