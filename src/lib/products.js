import PocketBase from "pocketbase";

const pb = new PocketBase("https://doctor-agua.pockethost.io");

let productos = [];

try {
  // await pb.admins.authWithPassword("pedro@gmail.com", "Pedro12345");

  const records = await pb.collection("productos_es").getList(0, 500, {
    expand: "pdfs_tabla, segmentos",
    sort: "-pdfs_tabla.num_de_fila",
  });
  productos = records.items.map((item) => {
    const collectionId = "productos_es"; // ID de la colección
    const recordId = item.id; // ID del registro actual
    const firstFilename = item.foto;

    // Construimos la URL manualmente
    const imageUrl = firstFilename
      ? `${pb.baseUrl}/api/files/${collectionId}/${recordId}/${firstFilename}`
      : "/path-to-placeholder-image.png"; // Placeholder en caso de que no haya imagen

    return {
      ...item,
      fotoUrl: imageUrl,
      nombre: item.nombre.toUpperCase(),
      urlName: item.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/_/g, "-") // Replace underscores with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim(), // Remove leading/trailing spaces
    };
  });
} catch (error) {
  console.error("Error al autenticarse o al obtener el registro:", error);
}

export { productos };
