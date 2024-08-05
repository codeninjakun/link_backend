/*
  Warnings:

  - You are about to drop the column `numOfVisits` on the `Stats` table. All the data in the column will be lost.
  - The `browser` column on the `Stats` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `location` column on the `Stats` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `aggregateVisits` to the `Stats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "numOfVisits",
ADD COLUMN     "aggregateVisits" INTEGER NOT NULL,
ADD COLUMN     "visits" JSONB[],
DROP COLUMN "browser",
ADD COLUMN     "browser" TEXT[],
DROP COLUMN "location",
ADD COLUMN     "location" TEXT[];
