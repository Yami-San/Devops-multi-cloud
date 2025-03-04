-- CreateTable
CREATE TABLE "Piloto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Piloto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avion" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "pilotoId" TEXT NOT NULL,

    CONSTRAINT "Avion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seguro" (
    "id" TEXT NOT NULL,
    "poliza" TEXT NOT NULL,
    "avionId" TEXT NOT NULL,

    CONSTRAINT "Seguro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Avion" ADD CONSTRAINT "Avion_pilotoId_fkey" FOREIGN KEY ("pilotoId") REFERENCES "Piloto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seguro" ADD CONSTRAINT "Seguro_avionId_fkey" FOREIGN KEY ("avionId") REFERENCES "Avion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
