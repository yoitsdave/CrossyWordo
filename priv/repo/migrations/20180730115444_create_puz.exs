defmodule Crossywordo.Repo.Migrations.CreatePuz do
  use Ecto.Migration

  def change do
    create table(:puzs) do
      add :loc, :string

      timestamps()
    end
  end
end
