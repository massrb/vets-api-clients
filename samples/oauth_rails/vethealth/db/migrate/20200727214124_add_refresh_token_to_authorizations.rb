class AddRefreshTokenToAuthorizations < ActiveRecord::Migration[5.2]
  def change
    add_column :authentications, :refresh_token, :string
  end
end
