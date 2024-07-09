-- AlterTable
ALTER TABLE "User" ADD COLUMN     "entrenadorId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
