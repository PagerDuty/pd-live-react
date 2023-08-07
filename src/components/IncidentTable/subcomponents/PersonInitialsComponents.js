import {
  connect,
} from 'react-redux';

import {
  Avatar,
  AvatarGroup,
  Link,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
} from '@chakra-ui/react';

const PersonInitialsComponent = ({
  users, displayedUsers,
}) => {
  const {
    usersMap,
  } = users;
  const displayedUsersByInitials = displayedUsers.length > 0
    ? displayedUsers.map(({
      user,
    }) => {
      let color;
      let email;
      if (usersMap[user.id]) {
        color = usersMap[user.id].color.replace('-', '');
        email = usersMap[user.id].email;
      } else {
        color = 'black';
        email = '';
      }
      return {
        summary: user.summary,
        // initials: getInitials(user.summary),
        id: user.id,
        html_url: user.html_url,
        email,
        color: CSS.supports && CSS.supports('color', color) ? color : 'black',
      };
    })
    : [];

  const popoverContent = (
    <TableContainer>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Summary</Th>
            <Th>Email</Th>
          </Tr>
        </Thead>
        <Tbody>
          {displayedUsersByInitials.map((user) => (
            <Tr key={user.id}>
              <Td>
                <Link key={user.id} isExternal href={user.html_url}>
                  {user.summary}
                </Link>
              </Td>
              <Td>
                <Link key={user.id} isExternal href={`mailto:${user.email}`}>
                  {user.email}
                </Link>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
  return (
    <div>
      <Popover trigger="hover" size="content">
        <PopoverTrigger>
          <AvatarGroup size="sm" max={3} spacing="-0.6rem">
            {displayedUsersByInitials.map((user) => (
              // <Tooltip key={user.id} label={user.summary} aria-label={user.summary}>
              <Link isExternal href={user.html_url}>
                <Avatar
                  color="white"
                  mr={1}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  name={user.summary}
                  href={user.html_url}
                  size="sm"
                  bg={user.color}
                  getInitials={(name) => {
                    const allNames = name.trim().split(' ');
                    const firstInitial = allNames[0].match(/./u);
                    const lastInitial = allNames[allNames.length - 1].match(/./u);
                    return `${firstInitial}${lastInitial}`;
                  }}
                />
              </Link>
            ))}
          </AvatarGroup>
        </PopoverTrigger>
        <PopoverContent w="content">
          <PopoverArrow />
          {popoverContent}
        </PopoverContent>
      </Popover>
    </div>
  );
};

const mapStateToProps = (state) => ({
  users: state.users,
});

export default connect(mapStateToProps)(PersonInitialsComponent);
