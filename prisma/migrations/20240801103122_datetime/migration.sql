/*
  Warnings:

  - The `timeLimit` column on the `Link` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Link" DROP COLUMN "timeLimit",
ADD COLUMN     "timeLimit" TIMESTAMP(3);
