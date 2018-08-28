defmodule Crossywordo.Repo.Migrations.CreateContacts do
  use Ecto.Migration

  def change do
    drop table(:contacts)

    create table(:contacts, primary_key: false) do
      add :user_id, references(:users, on_delete: :nothing), primary_key: true
      add :contact_id, references(:users, on_delete: :nothing), primary_key: true
      add :status, :int

      timestamps()
    end

  end
end
