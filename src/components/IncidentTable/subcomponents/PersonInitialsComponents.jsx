import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  useSelector,
  useDispatch,
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

import {
  addUserToUsersMap as addUserToUsersMapConnected,
} from 'src/redux/users/actions';

import {
  throttledPdAxiosRequest,
} from 'src/util/pd-api-wrapper';

const PersonInitialsComponent = ({
  displayedUsers,
}) => {
  const {
    usersMap,
  } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const addUserToUsersMap = useCallback((user) => {
    dispatch(addUserToUsersMapConnected(user));
  }, [dispatch]);

  const [displayedUsersByInitials, setDisplayedUsersByInitials] = useState([]);
  useEffect(() => {
    const promises = displayedUsers.map(async ({
      user,
    }) => {
      let retval;
      if (usersMap[user.id]) {
        retval = {
          summary: usersMap[user.id].summary,
          id: user.id,
          html_url: usersMap[user.id].html_url,
          email: usersMap[user.id].email,
          color: usersMap[user.id].color.replace('-', ''),
        };
      } else {
        addUserToUsersMap({
          id: user.id,
          summary: user.summary || 'Loading...',
          html_url: user.html_url || 'Loading...',
          email: user.email || 'Loading...',
          color: user.color?.replace('-', '') || 'Loading...',
        });
        const r = await throttledPdAxiosRequest('GET', `users/${user.id}`);
        const fetchedUser = r.data.user;
        addUserToUsersMap(fetchedUser);
        retval = {
          summary: fetchedUser.summary,
          id: user.id,
          html_url: fetchedUser.html_url,
          email: fetchedUser.email,
          color: fetchedUser.color.replace('-', ''),
        };
      }
      if (CSS.supports && !CSS.supports('color', retval.color)) {
        retval.color = 'black';
      }
      return retval;
    });
    Promise.all(promises).then((results) => {
      setDisplayedUsersByInitials(results);
    });
  }, [displayedUsers, addUserToUsersMap]);

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
                <Link isExternal href={user.html_url}>
                  {user.summary}
                </Link>
              </Td>
              <Td>
                <Link isExternal href={`mailto:${user.email}`}>
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
              <Link key={user.id} isExternal href={user.html_url}>
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

export default PersonInitialsComponent;
